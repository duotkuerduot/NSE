from __future__ import annotations

from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Stock(Base):
    __tablename__ = "stocks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ticker: Mapped[str] = mapped_column(String(16), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    sector: Mapped[str] = mapped_column(String(128), index=True)

    price_history: Mapped[list["PriceHistory"]] = relationship(
        back_populates="stock",
        cascade="all, delete-orphan",
    )
    features: Mapped[list["FeatureSnapshot"]] = relationship(
        back_populates="stock",
        cascade="all, delete-orphan",
    )


class PriceHistory(Base):
    __tablename__ = "price_history"
    __table_args__ = (UniqueConstraint("stock_id", "date", name="uq_price_stock_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    stock_id: Mapped[int] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"))
    date: Mapped[date] = mapped_column(Date, index=True)
    open: Mapped[float] = mapped_column(Float)
    close: Mapped[float] = mapped_column(Float)
    high: Mapped[float] = mapped_column(Float)
    low: Mapped[float] = mapped_column(Float)
    volume: Mapped[float] = mapped_column(Float)

    stock: Mapped[Stock] = relationship(back_populates="price_history")


class FeatureSnapshot(Base):
    __tablename__ = "features"
    __table_args__ = (UniqueConstraint("stock_id", "date", name="uq_feature_stock_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    stock_id: Mapped[int] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"))
    date: Mapped[date] = mapped_column(Date, index=True)
    rsi: Mapped[float] = mapped_column(Float)
    macd: Mapped[float] = mapped_column(Float)
    volatility: Mapped[float] = mapped_column(Float)
    returns: Mapped[float] = mapped_column(Float)

    stock: Mapped[Stock] = relationship(back_populates="features")
