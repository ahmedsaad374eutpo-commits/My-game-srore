"""الدخول + الطلبات. الأسعار من catalog.json في الخادم، والرصيد يتخصم بالـ ledger."""
import hashlib
import json
import os
import random
import secrets
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from db import (AuthSession, Order, OrderItem, User, credit_wallet, debit_wallet, get_current_user_id,
                get_db, token_hash)
from vodafone_topups import (MAX_PROOF_BYTES, PHONE_RE, PROOF_DIR, TXN_RE, TopUpRequest, _image_ext,
                             require_admin)

router = APIRouter(prefix="/api")
CATALOG = {c["sku"]: c["price_egp"] for c in json.loads(
    (Path(__file__).parent / "catalog.json").read_text(encoding="utf-8"))}
OPERATORS = {"فودافون", "اتصالات", "اورنج", "وي"}
SESSION_DAYS = 14
_fails: dict[str, list[float]] = {}


def _hash_pw(pw: str, salt: bytes | None = None) -> str:
    salt = salt or os.urandom(16)
    return f"{salt.hex()}${hashlib.scrypt(pw.encode(), salt=salt, n=2**14, r=8, p=1).hex()}"


def _check_pw(pw: str, stored: str) -> bool:
    salt, _ = stored.split("$")
    return secrets.compare_digest(_hash_pw(pw, bytes.fromhex(salt)), stored)


def _start_session(db: Session, resp: Response, user_id: int) -> None:
    token = secrets.token_urlsafe(32)
    db.add(AuthSession(token_hash=token_hash(token), user_id=user_id,
                       expires_at=datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)))
    db.commit()
    resp.set_cookie("session", token, max_age=SESSION_DAYS * 86400, httponly=True, samesite="lax",
                    secure=os.getenv("SECURE_COOKIES", "1") != "0")


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=120)
    password: str = Field(min_length=8, max_length=100)
    invite_code: str | None = None


class LoginIn(BaseModel):
    email: str
    password: str


@router.post("/auth/register", status_code=201)
def register(body: RegisterIn, resp: Response, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    if db.scalar(select(User.id).where(User.email == email)):
        raise HTTPException(409, "البريد الإلكتروني مسجل بالفعل")
    points = 20
    if body.invite_code and body.invite_code.strip():
        if not db.scalar(select(User.id).where(User.invite_code == body.invite_code.strip().upper())):
            raise HTTPException(422, "رمز الدعوة غير صحيح")
        points = 50
    code = f"SH{random.randint(1000, 9999)}"
    while db.scalar(select(User.id).where(User.invite_code == code)):
        code = f"SH{random.randint(10000, 99999)}"
    user = User(email=email, name=body.name.strip(), pw_hash=_hash_pw(body.password), invite_code=code, points=points)
    db.add(user)
    db.commit()
    _start_session(db, resp, user.id)
    return {"message": f"تم التسجيل بنجاح! حصلت على {points} نقطة 🎉"}


@router.post("/auth/login")
def login(body: LoginIn, resp: Response, db: Session = Depends(get_db)):
    key, now = body.email.strip().lower(), time.time()
    recent = [t for t in _fails.get(key, []) if now - t < 600]
    if len(recent) >= 8:
        raise HTTPException(429, "محاولات كتير، حاول بعد 10 دقايق")
    user = db.scalar(select(User).where(User.email == key))
    if not user or not _check_pw(body.password, user.pw_hash):
        _fails[key] = recent + [now]
        raise HTTPException(401, "بيانات الدخول غير صحيحة")
    _start_session(db, resp, user.id)
    return {"ok": True}


@router.post("/auth/logout")
def logout(resp: Response, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db.query(AuthSession).filter(AuthSession.user_id == user_id).delete()
    db.commit()
    resp.delete_cookie("session")
    return {"ok": True}


@router.get("/me")
def me(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    u = db.get(User, user_id)
    return {"name": u.name, "email": u.email, "invite_code": u.invite_code,
            "points": u.points, "balance": u.balance_piasters / 100}


class MobileIn(BaseModel):
    operator: str
    phone: str
    amount: int = Field(ge=5, le=1000)


class OrderIn(BaseModel):
    items: list[dict] = Field(default_factory=list, max_length=20)
    mobile: list[MobileIn] = Field(default_factory=list, max_length=10)
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=120)
    method: str
    note: str = Field(default="", max_length=500)


@router.post("/orders", status_code=201)
async def create_order(payload: str = Form(...), sender_number: str = Form(""), txn_ref: str = Form(""),
                       proof: UploadFile | None = File(None), db: Session = Depends(get_db),
                       user_id: int = Depends(get_current_user_id)):
    try:
        o = OrderIn.model_validate_json(payload)
    except ValueError:
        raise HTTPException(422, "بيانات الطلب غير صحيحة")
    lines: list[OrderItem] = []
    for it in o.items:
        price = CATALOG.get(str(it.get("sku")))
        if price is None:
            raise HTTPException(422, "منتج غير موجود")
        title, _, detail = str(it["sku"]).partition("|")
        lines.append(OrderItem(title=title, detail=detail, price_piasters=price * 100))
    for m in o.mobile:
        if m.operator not in OPERATORS or not PHONE_RE.match(m.phone):
            raise HTTPException(422, "بيانات شحن الرصيد غير صحيحة")
        lines.append(OrderItem(title=f"شحن {m.operator}", detail=m.phone, price_piasters=m.amount * 100))
    if not lines:
        raise HTTPException(422, "السلة فاضية")
    total = sum(l.price_piasters for l in lines)

    if o.method == "wallet":
        order = Order(user_id=user_id, total_piasters=total, payment_method="wallet", status="paid",
                      email=o.email, note=o.note)
        db.add(order)
        db.flush()
        debit_wallet(db, user_id, total, f"order:{order.id}")
        _finish_payment(db, order, lines)
        return {"id": order.id, "status": order.status}

    if o.method not in ("cash", "instapay"):
        raise HTTPException(422, "طريقة الدفع غير متاحة حالياً")
    if not PHONE_RE.match(sender_number.strip()) or not TXN_RE.match(txn_ref.strip()) or proof is None:
        raise HTTPException(422, "رقم المحوِّل ورقم العملية وصورة الإثبات مطلوبين")
    data = await proof.read(MAX_PROOF_BYTES + 1)
    ext = _image_ext(data[:12])
    if len(data) > MAX_PROOF_BYTES or not ext:
        raise HTTPException(422, "الإثبات لازم يكون صورة PNG أو JPG أو WEBP أقل من 5 ميجا")
    ref = txn_ref.strip()
    if (db.scalar(select(Order.id).where(Order.txn_ref == ref))
            or db.scalar(select(TopUpRequest.id).where(TopUpRequest.txn_ref == ref))):
        raise HTTPException(409, "رقم العملية ده مستخدم قبل كده")
    fname = f"{secrets.token_hex(16)}.{ext}"
    (PROOF_DIR / fname).write_bytes(data)
    order = Order(user_id=user_id, total_piasters=total, payment_method=o.method, status="awaiting_review",
                  email=o.email, note=o.note, sender_number=sender_number.strip(), txn_ref=ref, proof_file=fname)
    db.add(order)
    db.flush()
    _finish_payment(db, order, lines, add_points=False)
    return {"id": order.id, "status": order.status}


def _finish_payment(db: Session, order: Order, lines: list[OrderItem], add_points: bool = True) -> None:
    for l in lines:
        l.order_id = order.id
        db.add(l)
    if add_points:
        db.execute(update(User).where(User.id == order.user_id).values(points=User.points + order.total_piasters // 1000))
    db.commit()


@router.get("/orders")
def my_orders(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    rows = db.scalars(select(Order).where(Order.user_id == user_id).order_by(Order.id.desc()).limit(50)).all()
    return [{"id": r.id, "total": r.total_piasters / 100, "status": r.status, "method": r.payment_method} for r in rows]


# ───── الأدمن (X-Admin-Key) ─────
def _move(db: Session, order_id: int, src: str, dst: str) -> Order:
    res = db.execute(update(Order).where(Order.id == order_id, Order.status == src).values(status=dst))
    if res.rowcount != 1:
        db.rollback()
        raise HTTPException(409, f"الطلب مش في حالة {src}")
    return db.get(Order, order_id)


@router.get("/admin/orders")
def admin_orders(status: str = "awaiting_review", db: Session = Depends(get_db), _: str = Depends(require_admin)):
    rows = db.scalars(select(Order).where(Order.status == status).order_by(Order.id).limit(200)).all()
    out = []
    for r in rows:
        items = db.scalars(select(OrderItem).where(OrderItem.order_id == r.id)).all()
        out.append({"id": r.id, "total": r.total_piasters / 100, "method": r.payment_method, "email": r.email,
                    "note": r.note, "sender": r.sender_number, "txn_ref": r.txn_ref,
                    "items": [{"title": i.title, "detail": i.detail, "price": i.price_piasters / 100} for i in items]})
    return out


@router.post("/admin/orders/{order_id}/approve")
def admin_approve(order_id: int, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    o = _move(db, order_id, "awaiting_review", "paid")
    db.execute(update(User).where(User.id == o.user_id).values(points=User.points + o.total_piasters // 1000))
    db.commit()
    return {"id": o.id, "status": o.status}


@router.post("/admin/orders/{order_id}/reject")
def admin_reject(order_id: int, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    o = _move(db, order_id, "awaiting_review", "rejected")
    db.commit()
    return {"id": o.id, "status": o.status}


@router.post("/admin/orders/{order_id}/fulfill")
def admin_fulfill(order_id: int, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    # هنا يتركب adapter مزوّد الألعاب لاحقاً؛ حالياً التسليم يدوي ثم تأكيده من هنا
    o = _move(db, order_id, "paid", "fulfilled")
    db.commit()
    return {"id": o.id, "status": o.status}


@router.post("/admin/orders/{order_id}/refund")
def admin_refund(order_id: int, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    o = _move(db, order_id, "paid", "refunded")
    credit_wallet(db, o.user_id, o.total_piasters, f"refund:{o.id}")  # الاسترداد دايماً للمحفظة
    db.commit()
    return {"id": o.id, "status": o.status}
