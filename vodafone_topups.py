"""شحن المحفظة بفودافون كاش: العميل يرفع الإثبات، الأدمن يؤكد، الرصيد يُضاف مرة واحدة فقط.

التشغيل: app.include_router(vodafone_topups.router)
"""
import os
import re
import secrets
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func, select, update
from sqlalchemy.orm import Mapped, Session, mapped_column

from db import Base, Order, credit_wallet, get_current_user_id, get_db

STORE_NUMBER = "01065028436"
PROOF_DIR = Path(os.getenv("PROOF_DIR", "private_proofs"))  # خارج أي مجلد static
PROOF_DIR.mkdir(parents=True, exist_ok=True)
MAX_PROOF_BYTES = 5 * 1024 * 1024
MIN_EGP, MAX_EGP = 10, 10_000
MAX_PENDING_PER_USER = 3
PHONE_RE = re.compile(r"^01[0125]\d{8}$")
TXN_RE = re.compile(r"^[A-Za-z0-9]{6,30}$")


class TopUpRequest(Base):
    __tablename__ = "wallet_topup_requests"
    __table_args__ = (UniqueConstraint("method", "txn_ref", name="uq_topup_method_txn"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)
    method: Mapped[str] = mapped_column(String(20), default="vodafone_cash")
    amount_piasters: Mapped[int] = mapped_column(Integer)
    sender_number: Mapped[str] = mapped_column(String(11))
    txn_ref: Mapped[str] = mapped_column(String(30))
    proof_file: Mapped[str] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(10), default="pending", index=True)
    reject_reason: Mapped[str | None] = mapped_column(String(200), nullable=True)
    reviewed_by: Mapped[str | None] = mapped_column(String(80), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


def require_admin(x_admin_key: str = Header(default="")) -> str:
    expected = os.getenv("ADMIN_KEY", "")
    if not expected or not secrets.compare_digest(x_admin_key, expected):
        raise HTTPException(403, "غير مصرح")
    return "admin"  # استبدلها بهوية الأدمن الحقيقية للتدقيق
router = APIRouter()


def _image_ext(head: bytes) -> str | None:
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if head.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "webp"
    return None


def _out(t: TopUpRequest) -> dict:
    return {
        "id": t.id, "amount": t.amount_piasters / 100, "method": t.method,
        "sender": t.sender_number, "txn_ref": t.txn_ref, "status": t.status,
        "reject_reason": t.reject_reason, "created_at": t.created_at,
    }


@router.post("/api/wallet/topups", status_code=201)
async def create_topup(
    amount: str = Form(...),
    sender_number: str = Form(...),
    txn_ref: str = Form(...),
    method: str = Form("cash"),
    proof: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    try:
        amt = Decimal(amount)
    except InvalidOperation:
        raise HTTPException(422, "المبلغ غير صحيح")
    if not (MIN_EGP <= amt <= MAX_EGP) or amt != amt.quantize(Decimal("0.01")):
        raise HTTPException(422, f"المبلغ لازم يكون بين {MIN_EGP} و {MAX_EGP} جنيه")
    methods = {"cash": "vodafone_cash", "instapay": "instapay"}
    if method not in methods:
        raise HTTPException(422, "طريقة الشحن غير متاحة")
    if not PHONE_RE.match(sender_number.strip()):
        raise HTTPException(422, "رقم المحوِّل غير صحيح")
    txn_ref = txn_ref.strip()
    if not TXN_RE.match(txn_ref):
        raise HTTPException(422, "رقم العملية غير صحيح")

    data = await proof.read(MAX_PROOF_BYTES + 1)
    if len(data) > MAX_PROOF_BYTES:
        raise HTTPException(413, "الصورة أكبر من 5 ميجا")
    ext = _image_ext(data[:12])
    if not ext:
        raise HTTPException(422, "الملف لازم يكون صورة PNG أو JPG أو WEBP")

    pending = db.scalar(select(func.count()).select_from(TopUpRequest)
                        .where(TopUpRequest.user_id == user_id, TopUpRequest.status == "pending"))
    if pending >= MAX_PENDING_PER_USER:
        raise HTTPException(429, "عندك طلبات كتير قيد المراجعة، استنى لحد ما تتراجع")
    if (db.scalar(select(TopUpRequest.id).where(TopUpRequest.txn_ref == txn_ref))
            or db.scalar(select(Order.id).where(Order.txn_ref == txn_ref))):
        raise HTTPException(409, "رقم العملية ده مستخدم قبل كده")

    fname = f"{secrets.token_hex(16)}.{ext}"
    (PROOF_DIR / fname).write_bytes(data)
    t = TopUpRequest(user_id=user_id, method=methods[method], amount_piasters=int(amt * 100),
                     sender_number=sender_number.strip(), txn_ref=txn_ref, proof_file=fname)
    db.add(t)
    db.commit()
    db.refresh(t)
    return _out(t)


@router.get("/api/wallet/topups")
def my_topups(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    rows = db.scalars(select(TopUpRequest).where(TopUpRequest.user_id == user_id)
                      .order_by(TopUpRequest.id.desc()).limit(50)).all()
    return [_out(t) for t in rows]


@router.get("/api/admin/topups")
def admin_list(status: str = "pending", db: Session = Depends(get_db), _: str = Depends(require_admin)):
    rows = db.scalars(select(TopUpRequest).where(TopUpRequest.status == status)
                      .order_by(TopUpRequest.id).limit(200)).all()
    return [{**_out(t), "user_id": t.user_id} for t in rows]


@router.get("/api/admin/topups/{topup_id}/proof")
def admin_proof(topup_id: int, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    t = db.get(TopUpRequest, topup_id)
    if not t:
        raise HTTPException(404, "الطلب غير موجود")
    return FileResponse(PROOF_DIR / t.proof_file)


def _claim(db: Session, topup_id: int, new_status: str, admin: str, reason: str | None = None):
    """ينقل الطلب من pending لحالة جديدة ذرّياً: لو اتراجع قبل كده يرجع 409 (يمنع الشحن مرتين)."""
    res = db.execute(update(TopUpRequest)
                     .where(TopUpRequest.id == topup_id, TopUpRequest.status == "pending")
                     .values(status=new_status, reviewed_by=admin, reject_reason=reason,
                             reviewed_at=datetime.now(timezone.utc)))
    if res.rowcount != 1:
        db.rollback()
        raise HTTPException(409, "الطلب اتراجع قبل كده أو غير موجود")
    return db.get(TopUpRequest, topup_id)


@router.post("/api/admin/topups/{topup_id}/approve")
def approve(topup_id: int, db: Session = Depends(get_db), admin: str = Depends(require_admin)):
    try:
        t = _claim(db, topup_id, "approved", admin)
        credit_wallet(db, t.user_id, t.amount_piasters, f"vodafone_topup:{t.id}")
        db.commit()  # تغيير الحالة والرصيد في transaction واحدة
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise
    return _out(t)


@router.post("/api/admin/topups/{topup_id}/reject")
def reject(topup_id: int, reason: str = Form(..., max_length=200),
           db: Session = Depends(get_db), admin: str = Depends(require_admin)):
    t = _claim(db, topup_id, "rejected", admin, reason)
    db.commit()
    return _out(t)
