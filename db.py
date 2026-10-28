"""قاعدة البيانات والـ ledger والجلسات."""
import hashlib
import os
from datetime import datetime, timezone

from fastapi import Cookie, Depends, HTTPException
from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, create_engine, func, select, update
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

URL = os.getenv("DATABASE_URL", "sqlite:///./shop.db")
engine = create_engine(URL, connect_args={"check_same_thread": False} if URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True)
    name: Mapped[str] = mapped_column(String(60))
    pw_hash: Mapped[str] = mapped_column(String(200))
    invite_code: Mapped[str] = mapped_column(String(12), unique=True)
    balance_piasters: Mapped[int] = mapped_column(Integer, default=0)
    points: Mapped[int] = mapped_column(Integer, default=0)


class AuthSession(Base):
    __tablename__ = "auth_sessions"
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class LedgerEntry(Base):
    __tablename__ = "ledger"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    delta_piasters: Mapped[int] = mapped_column(Integer)
    reference: Mapped[str] = mapped_column(String(60), unique=True)  # يمنع تكرار أي حركة
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (UniqueConstraint("payment_method", "txn_ref", name="uq_order_method_txn"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    total_piasters: Mapped[int] = mapped_column(Integer)
    payment_method: Mapped[str] = mapped_column(String(20))
    # awaiting_review -> paid -> fulfilled | rejected | refunded
    status: Mapped[str] = mapped_column(String(16), index=True)
    email: Mapped[str] = mapped_column(String(120))
    note: Mapped[str] = mapped_column(String(500), default="")
    sender_number: Mapped[str | None] = mapped_column(String(11), nullable=True)
    txn_ref: Mapped[str | None] = mapped_column(String(30), nullable=True)
    proof_file: Mapped[str | None] = mapped_column(String(80), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class OrderItem(Base):
    __tablename__ = "order_items"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), index=True)
    title: Mapped[str] = mapped_column(String(120))
    detail: Mapped[str] = mapped_column(String(40), default="")
    price_piasters: Mapped[int] = mapped_column(Integer)


def get_db():
    with SessionLocal() as db:
        yield db


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def get_current_user_id(db: Session = Depends(get_db), session: str | None = Cookie(default=None)) -> int:
    row = db.get(AuthSession, token_hash(session)) if session else None
    exp = row.expires_at.replace(tzinfo=timezone.utc) if row and row.expires_at.tzinfo is None else (row.expires_at if row else None)
    if not row or exp <= datetime.now(timezone.utc):
        raise HTTPException(401, "سجل الدخول أولاً")
    return row.user_id


def credit_wallet(db: Session, user_id: int, amount_piasters: int, reference: str) -> None:
    """إضافة رصيد. idempotent على reference، وبدون commit (المنادي هو اللي يعمل commit)."""
    if db.scalar(select(LedgerEntry.id).where(LedgerEntry.reference == reference)):
        return
    db.add(LedgerEntry(user_id=user_id, delta_piasters=amount_piasters, reference=reference))
    db.execute(update(User).where(User.id == user_id)
               .values(balance_piasters=User.balance_piasters + amount_piasters))
    db.flush()


def debit_wallet(db: Session, user_id: int, amount_piasters: int, reference: str) -> None:
    res = db.execute(update(User).where(User.id == user_id, User.balance_piasters >= amount_piasters)
                     .values(balance_piasters=User.balance_piasters - amount_piasters))
    if res.rowcount != 1:
        db.rollback()
        raise HTTPException(402, "رصيد المحفظة غير كافٍ")
    db.add(LedgerEntry(user_id=user_id, delta_piasters=-amount_piasters, reference=reference))
    db.flush()
