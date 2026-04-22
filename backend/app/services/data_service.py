from __future__ import annotations

from typing import Any

import pandas as pd

from app.core.config import Settings
from app.core.logging import get_logger
from app.ml.features import build_feature_frame, build_sector_map, clean_market_data
from app.repositories.stock_repository import StockRepository
from app.utils.dataframe import safe_read_csv

logger = get_logger(__name__)


class DataService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._market_frame: pd.DataFrame | None = None
        self._feature_frame: pd.DataFrame | None = None

    def initialize(self) -> None:
        if self._market_frame is not None and self._feature_frame is not None:
            return

        stock_files = sorted(self.settings.raw_data_dir.glob("NSE_data_all_stocks_*.csv"))
        sector_files = sorted(self.settings.raw_data_dir.glob("NSE_data_stock_market_sectors*.csv"))
        if not stock_files:
            raise FileNotFoundError(
                f"No stock data files found in {self.settings.raw_data_dir}"
            )
        if not sector_files:
            raise FileNotFoundError(
                f"No sector data files found in {self.settings.raw_data_dir}"
            )

        logger.info(
            "loading_market_data",
            extra={"stock_files": len(stock_files), "sector_files": len(sector_files)},
        )

        raw_frames = [safe_read_csv(path) for path in stock_files]
        sector_frames = [safe_read_csv(path) for path in sector_files]
        sector_map = build_sector_map(sector_frames)

        self._market_frame = clean_market_data(raw_frames, sector_map)
        self._feature_frame = build_feature_frame(
            self._market_frame,
            prediction_horizon_days=self.settings.prediction_horizon_days,
            drawdown_threshold=self.settings.risk_drawdown_threshold,
        )

    def get_market_frame(self) -> pd.DataFrame:
        self.initialize()
        return self._market_frame.copy()

    def get_feature_frame(self) -> pd.DataFrame:
        self.initialize()
        return self._feature_frame.copy()

    def list_tickers(self) -> list[str]:
        frame = self.get_market_frame()
        return sorted(frame["ticker"].unique().tolist())

    def get_ticker_frame(self, ticker: str) -> pd.DataFrame:
        frame = self.get_feature_frame()
        filtered = frame.loc[frame["ticker"] == ticker.upper()].sort_values("date")
        if filtered.empty:
            raise KeyError(f"Ticker {ticker.upper()} not found")
        return filtered.copy()

    def get_latest_snapshot(self) -> pd.DataFrame:
        frame = self.get_feature_frame()
        latest = frame.sort_values(["ticker", "date"]).groupby("ticker", as_index=False).tail(1)
        return latest.reset_index(drop=True)

    def get_price_history(self, ticker: str, limit: int = 180) -> list[dict[str, Any]]:
        ticker_frame = self.get_ticker_frame(ticker).tail(limit)
        return [
            {"date": row.date.strftime("%Y-%m-%d"), "price": float(row.close)}
            for row in ticker_frame.itertuples()
        ]

    def get_stock_metadata(self, ticker: str) -> dict[str, str]:
        ticker_frame = self.get_ticker_frame(ticker)
        latest = ticker_frame.iloc[-1]
        return {
            "ticker": str(latest["ticker"]),
            "name": str(latest["name"]),
            "sector": str(latest["sector"]),
        }

    def describe_liquidity(self, ticker: str) -> str:
        latest = self.get_latest_snapshot()
        current = latest.loc[latest["ticker"] == ticker.upper()]
        if current.empty:
            raise KeyError(f"Ticker {ticker.upper()} not found")

        value = float(current.iloc[0]["liquidity_value"])
        quantiles = latest["liquidity_value"].quantile([0.33, 0.66]).tolist()
        if value >= quantiles[1]:
            return "High"
        if value >= quantiles[0]:
            return "Moderate"
        return "Low"

    def describe_volatility(self, ticker: str) -> str:
        latest = self.get_latest_snapshot()
        current = latest.loc[latest["ticker"] == ticker.upper()]
        if current.empty:
            raise KeyError(f"Ticker {ticker.upper()} not found")

        value = float(current.iloc[0]["volatility_value"])
        quantiles = latest["volatility_value"].quantile([0.33, 0.66]).tolist()
        if value >= quantiles[1]:
            return "High"
        if value >= quantiles[0]:
            return "Moderate"
        return "Low"

    async def bootstrap_database(self, repository: StockRepository) -> None:
        market_frame = self.get_market_frame()
        feature_frame = self.get_feature_frame()

        stock_records = (
            market_frame.sort_values("date")
            .groupby("ticker", as_index=False)
            .tail(1)[["ticker", "name", "sector"]]
            .to_dict(orient="records")
        )
        price_records = market_frame.to_dict(orient="records")
        feature_records = feature_frame[
            ["ticker", "date", "rsi_14", "macd", "volatility_value", "return_1d"]
        ].to_dict(orient="records")

        ticker_map = await repository.upsert_stocks(stock_records)
        await repository.sync_price_history(ticker_map, price_records)
        await repository.sync_features(ticker_map, feature_records)
        logger.info("database_bootstrap_complete", extra={"tickers": len(ticker_map)})
