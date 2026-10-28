"""لوحة الأدمن (Jinja2 + HTMX) لمراجعة طلبات شحن فودافون كاش.

التشغيل: app.include_router(admin_topups_ui.router)
المتغيرات: ADMIN_KEY (إجباري) و ADMIN_COOKIE_SECRET (اختياري) و SECURE_COOKIES=0 للتجربة المحلية على http.
"""
import hashlib
import hmac
import os
import secrets
import time

from fastapi import APIRouter, Depends, Form, Header, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from jinja2 import DictLoader, Environment
from sqlalchemy import select
from sqlalchemy.orm import Session

import vodafone_topups as core
from vodafone_topups import TopUpRequest

router = APIRouter()
COOKIE = "admin_session"
SESSION_SECONDS = 8 * 3600
_fails: dict[str, list[float]] = {}

TEMPLATES = Environment(autoescape=True, loader=DictLoader({
"base": """<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>مراجعة الشحن</title>
<script src="https://unpkg.com/htmx.org@1.9.12"></script>
<style>body{font-family:system-ui,sans-serif;margin:0;background:#f8fafc;color:#0f172a}
main{max-width:1000px;margin:auto;padding:16px}table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden}
th,td{padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;vertical-align:middle}th{background:#f1f5f9}
a.tab{padding:6px 14px;border-radius:8px;text-decoration:none;color:#334155;background:#e2e8f0;margin-left:6px}a.on{background:#ea580c;color:#fff}
button{border:0;border-radius:8px;padding:8px 14px;font-weight:700;color:#fff;cursor:pointer}.ok{background:#16a34a}.no{background:#dc2626}
img{max-height:70px;border-radius:6px}.num{direction:ltr;unicode-bidi:embed}input{padding:10px;border:1px solid #cbd5e1;border-radius:8px}</style>
</head><body><main>{% block body %}{% endblock %}</main></body></html>""",
"login": """{% extends "base" %}{% block body %}<h2>دخول الأدمن</h2>
{% if error %}<p style="color:#dc2626">{{ error }}</p>{% endif %}
<form method="post" action="/admin/login"><input type="password" name="key" placeholder="مفتاح الأدمن" required>
<button class="ok" type="submit">دخول</button></form>{% endblock %}""",
"list": """{% extends "base" %}{% block body %}<h2>طلبات شحن فودافون كاش</h2>
<p>{% for s,l in tabs %}<a class="tab {{ 'on' if s==status }}" href="/admin/topups?status={{ s }}">{{ l }}</a>{% endfor %}</p>
<table><tr><th>#</th><th>المبلغ / الطريقة</th><th>رقم المحوِّل</th><th>رقم العملية</th><th>الإثبات</th><th>الحالة / الإجراء</th></tr>
{% for t in rows %}{% include "row" %}{% else %}<tr><td colspan="6">لا توجد طلبات</td></tr>{% endfor %}</table>{% endblock %}""",
"row": """<tr id="t{{ t.id }}"><td>{{ t.id }}</td><td><b>{{ t.amount_piasters / 100 }}</b> ج.م<br>{{ "فودافون كاش" if t.method == "vodafone_cash" else "إنستا باي" }}</td>
<td class="num">{{ t.sender_number }}</td><td class="num">{{ t.txn_ref }}</td>
<td><a href="/admin/topups/{{ t.id }}/proof" target="_blank"><img src="/admin/topups/{{ t.id }}/proof" alt="إثبات"></a></td>
<td>{% if t.status == 'pending' %}
<button class="ok" hx-post="/admin/topups/{{ t.id }}/approve" hx-target="#t{{ t.id }}" hx-swap="outerHTML"
 hx-confirm="تأكيد إضافة {{ t.amount_piasters / 100 }} ج.م للمحفظة؟ تأكد إنك استلمتها فعلاً على الرقم.">تأكيد</button>
<button class="no" hx-post="/admin/topups/{{ t.id }}/reject" hx-prompt="سبب الرفض" hx-target="#t{{ t.id }}" hx-swap="outerHTML">رفض</button>
{% elif t.status == 'approved' %}✅ تم الشحن{% else %}❌ مرفوض: {{ t.reject_reason }}{% endif %}</td></tr>""",
}))


def _render(name: str, **ctx) -> str:
    return TEMPLATES.get_template(name).render(**ctx)


def _secret() -> bytes:
    return (os.getenv("ADMIN_COOKIE_SECRET") or os.getenv("ADMIN_KEY", "")).encode()


def _sign(exp: int) -> str:
    return f"{exp}.{hmac.new(_secret(), str(exp).encode(), hashlib.sha256).hexdigest()}"


def _valid(token: str | None) -> bool:
    try:
        exp, sig = (token or "").split(".", 1)
        good = hmac.new(_secret(), exp.encode(), hashlib.sha256).hexdigest()
        return bool(_secret()) and hmac.compare_digest(sig, good) and int(exp) > time.time()
    except ValueError:
        return False


def admin_session(request: Request) -> str:
    if not _valid(request.cookies.get(COOKIE)):
        raise HTTPException(303, headers={"Location": "/admin/login"})
    return "admin"


def _htmx_only(hx_request: str = Header(default="")) -> None:
    # حماية CSRF إضافية: المواقع الأخرى ما تقدرش تضيف هيدر مخصص
    if hx_request != "true":
        raise HTTPException(403, "طلب غير صالح")


@router.get("/admin/login", response_class=HTMLResponse)
def login_page():
    return _render("login", error=None)


@router.post("/admin/login")
def login(request: Request, key: str = Form(...)):
    ip = request.client.host if request.client else "?"
    now = time.time()
    recent = [t for t in _fails.get(ip, []) if now - t < 600]
    if len(recent) >= 5:
        raise HTTPException(429, "محاولات كتير، حاول بعد 10 دقايق")
    expected = os.getenv("ADMIN_KEY", "")
    if not expected or not secrets.compare_digest(key, expected):
        _fails[ip] = recent + [now]
        return HTMLResponse(_render("login", error="المفتاح غير صحيح"), status_code=401)
    resp = RedirectResponse("/admin/topups", status_code=303)
    resp.set_cookie(COOKIE, _sign(int(now) + SESSION_SECONDS), max_age=SESSION_SECONDS, httponly=True,
                    samesite="strict", secure=os.getenv("SECURE_COOKIES", "1") != "0")
    return resp


@router.get("/admin/topups", response_class=HTMLResponse)
def list_page(status: str = "pending", db: Session = Depends(core.get_db), _: str = Depends(admin_session)):
    if status not in ("pending", "approved", "rejected"):
        raise HTTPException(422, "حالة غير معروفة")
    rows = db.scalars(select(TopUpRequest).where(TopUpRequest.status == status)
                      .order_by(TopUpRequest.id).limit(200)).all()
    tabs = [("pending", "قيد المراجعة"), ("approved", "تم الشحن"), ("rejected", "مرفوضة")]
    return _render("list", rows=rows, status=status, tabs=tabs)


@router.get("/admin/topups/{topup_id}/proof")
def proof(topup_id: int, db: Session = Depends(core.get_db), _: str = Depends(admin_session)):
    t = db.get(TopUpRequest, topup_id)
    if not t:
        raise HTTPException(404, "الطلب غير موجود")
    return FileResponse(core.PROOF_DIR / t.proof_file, headers={"X-Content-Type-Options": "nosniff"})


@router.post("/admin/topups/{topup_id}/approve", response_class=HTMLResponse)
def ui_approve(topup_id: int, db: Session = Depends(core.get_db),
               admin: str = Depends(admin_session), _: None = Depends(_htmx_only)):
    core.approve(topup_id, db, admin)
    return _render("row", t=db.get(TopUpRequest, topup_id))


@router.post("/admin/topups/{topup_id}/reject", response_class=HTMLResponse)
def ui_reject(topup_id: int, hx_prompt: str = Header(default=""), db: Session = Depends(core.get_db),
              admin: str = Depends(admin_session), _: None = Depends(_htmx_only)):
    reason = hx_prompt.strip()[:200]
    if not reason:
        raise HTTPException(422, "اكتب سبب الرفض")
    core.reject(topup_id, reason, db, admin)
    return _render("row", t=db.get(TopUpRequest, topup_id))
