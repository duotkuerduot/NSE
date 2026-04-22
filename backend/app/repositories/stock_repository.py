from __future__ import annotations

from collections.abc import Iterable

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.logging import get_logger
from app.models.market import FeatureSnapshot, PriceHistory, Stock

logger = get_logger(__name__)


class StockRepository:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self.session_factory = session_factory

    async def get_stock_by_ticker(self, ticker: str) -> Stock | None:
        async with self.session_factory() as session:
            result = await session.execute(
                select(Stock).where(Stock.ticker == ticker.upper())
            )
            return result.scalar_one_or_none()

    async def list_stocks(self) -> list[Stock]:
        async with self.session_factory() as session:
            result = await session.execute(select(Stock).order_by(Stock.ticker.asc()))
            return list(result.scalars().all())

    async def upsert_stocks(self, records: Iterable[dict[str, str]]) -> dict[str, int]:
        async with self.session_factory() as session:
            ticker_map: dict[str, int] = {}
            for record in records:
                ticker = record["ticker"].upper()
                result = await session.execute(select(Stock).where(Stock.ticker == ticker))
                stock = result.scalar_one_or_none()
                if stock is None:
                    stock = Stock(
                        ticker=ticker,
                        name=record["name"],
                        sector=record["sector"],
                    )
                    session.add(stock)
                    await session.flush()
                else:
                    stock.name = record["name"]
                    stock.sector = record["sector"]

                ticker_map[ticker] = stock.id

            await session.commit()
            return ticker_map

    async def sync_price_history(
        self,
        stock_id_map: dict[str, int],
        records: Iterable[dict[str, object]],
    ) -> None:
        async with self.session_factory() as session:
            for record in records:
                ticker = str(record["ticker"]).upper()
                stock_id = stock_id_map.get(ticker)
                if stock_id is None:
                    continue

                result = await session.execute(
                    select(PriceHistory).where(
                        PriceHistory.stock_id == stock_id,
                        PriceHistory.date == record["date"],
                    )
                )
                entity = result.scalar_one_or_none()
                if entity is None:
                    session.add(
                        PriceHistory(
                            stock_id=stock_id,
                            date=record["date"],
                            open=float(record["open"]),
                            close=float(record["close"]),
                            high=float(record["high"]),
                            low=float(record["low"]),
                            volume=float(record["volume"]),
                        )
                    )
                    continue

                entity.open = float(record["open"])
                entity.close = float(record["close"])
                entity.high = float(record["high"])
                entity.low = float(record["low"])
                entity.volume = float(record["volume"])

            await session.commit()

    async def sync_features(
        self,
        stock_id_map: dict[str, int],
        records: Iterable[dict[str, object]],
    ) -> None:
        async with self.session_factory() as session:
            for record in records:
                ticker = str(record["ticker"]).upper()
                stock_id = stock_id_map.get(ticker)
                if stock_id is None:
                    continue

                result = await session.execute(
                    select(FeatureSnapshot).where(
                        FeatureSnapshot.stock_id == stock_id,
                        FeatureSnapshot.date == record["date"],
                    )
                )
                entity = result.scalar_one_or_none()
                if entity is None:
                    session.add(
                        FeatureSnapshot(
                            stock_id=stock_id,
                            date=record["date"],
                            rsi=float(record["rsi_14"]),
                            macd=float(record["macd"]),
                            volatility=float(record["volatility_value"]),
                            returns=float(record["return_1d"]),
                        )
                    )
                    continue

                entity.rsi = float(record["rsi_14"])
                entity.macd = float(record["macd"])
                entity.volatility = float(record["volatility_value"])
                entity.returns = float(record["return_1d"])

            await session.commit()
