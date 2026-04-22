from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from app.utils.dataframe import coerce_numeric

FEATURE_COLUMNS = [
    "return_1d",
    "return_5d",
    "return_20d",
    "volatility_20d",
    "rsi_14",
    "macd",
    "macd_signal",
    "sma_5_ratio",
    "sma_20_ratio",
    "volume_ratio_20d",
    "intraday_range",
]


@dataclass(slots=True)
class FeatureArtifacts:
    market_frame: pd.DataFrame
    feature_frame: pd.DataFrame


def build_sector_map(sector_frames: list[pd.DataFrame]) -> dict[str, str]:
    combined = pd.concat(sector_frames, ignore_index=True)
    combined = combined.rename(
        columns={
            "Sector": "sector",
            "Stock_code": "ticker",
            "Stock_name": "name",
        }
    )
    combined["ticker"] = combined["ticker"].astype(str).str.upper().str.strip()
    combined = combined.dropna(subset=["ticker", "sector"]).drop_duplicates(
        subset=["ticker"], keep="last"
    )
    return dict(zip(combined["ticker"], combined["sector"], strict=False))


def clean_market_data(raw_frames: list[pd.DataFrame], sector_map: dict[str, str]) -> pd.DataFrame:
    frame = pd.concat(raw_frames, ignore_index=True)
    frame = frame.rename(
        columns={
            "Date": "date",
            "Code": "ticker",
            "Name": "name",
            "Day Low": "low",
            "Day High": "high",
            "Day Price": "close",
            "Previous": "open",
            "Volume": "volume",
        }
    )

    numeric_columns = ["low", "high", "close", "open", "volume"]
    for column in numeric_columns:
        frame[column] = coerce_numeric(frame[column])

    frame["date"] = pd.to_datetime(frame["date"], format="%d-%b-%y", errors="coerce")
    frame["ticker"] = frame["ticker"].astype(str).str.upper().str.strip()
    frame["name"] = frame["name"].astype(str).str.strip()
    frame["sector"] = frame["ticker"].map(sector_map).fillna("Diversified")

    frame["open"] = frame["open"].fillna(frame["close"])
    frame["high"] = frame["high"].fillna(frame["close"])
    frame["low"] = frame["low"].fillna(frame["close"])
    frame["volume"] = frame["volume"].fillna(0.0)

    frame = frame.dropna(subset=["date", "ticker", "close"]).sort_values(
        ["ticker", "date"]
    )
    frame = frame.drop_duplicates(subset=["ticker", "date"], keep="last")
    frame = frame[["date", "ticker", "name", "sector", "open", "close", "high", "low", "volume"]]
    frame["open"] = frame["open"].replace(0, np.nan).fillna(frame["close"])
    frame["high"] = frame[["high", "close", "open"]].max(axis=1)
    frame["low"] = frame[["low", "close", "open"]].min(axis=1)
    return frame.reset_index(drop=True)


def _compute_rsi(close_series: pd.Series, window: int = 14) -> pd.Series:
    delta = close_series.diff()
    gains = delta.clip(lower=0)
    losses = -delta.clip(upper=0)
    average_gain = gains.rolling(window=window, min_periods=window).mean()
    average_loss = losses.rolling(window=window, min_periods=window).mean()
    rs = average_gain / average_loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(50.0)


def _future_drawdown(close_series: pd.Series, horizon: int) -> pd.Series:
    future_min = pd.concat(
        [close_series.shift(-step) for step in range(1, horizon + 1)],
        axis=1,
    ).min(axis=1)
    return ((future_min / close_series) - 1) * 100


def build_feature_frame(
    market_frame: pd.DataFrame,
    prediction_horizon_days: int,
    drawdown_threshold: float,
) -> pd.DataFrame:
    feature_frame = market_frame.copy()
    grouped = feature_frame.groupby("ticker", group_keys=False)

    feature_frame["return_1d"] = grouped["close"].pct_change(1) * 100
    feature_frame["return_5d"] = grouped["close"].pct_change(5) * 100
    feature_frame["return_20d"] = grouped["close"].pct_change(20) * 100
    feature_frame["volatility_20d"] = grouped["close"].transform(
        lambda series: series.pct_change().rolling(window=20, min_periods=10).std()
        * np.sqrt(20)
        * 100
    )

    feature_frame["rsi_14"] = grouped["close"].transform(_compute_rsi)
    ema_fast = grouped["close"].transform(lambda series: series.ewm(span=12, adjust=False).mean())
    ema_slow = grouped["close"].transform(lambda series: series.ewm(span=26, adjust=False).mean())
    feature_frame["macd"] = ema_fast - ema_slow
    feature_frame["macd_signal"] = (
        feature_frame.groupby("ticker")["macd"]
        .transform(lambda series: series.ewm(span=9, adjust=False).mean())
    )

    sma_5 = grouped["close"].transform(lambda series: series.rolling(window=5, min_periods=3).mean())
    sma_20 = grouped["close"].transform(lambda series: series.rolling(window=20, min_periods=10).mean())
    vol_avg_20 = grouped["volume"].transform(lambda series: series.rolling(window=20, min_periods=5).mean())

    feature_frame["sma_5_ratio"] = ((feature_frame["close"] / sma_5) - 1) * 100
    feature_frame["sma_20_ratio"] = ((feature_frame["close"] / sma_20) - 1) * 100
    feature_frame["volume_ratio_20d"] = feature_frame["volume"] / vol_avg_20.replace(0, np.nan)
    feature_frame["intraday_range"] = (
        (feature_frame["high"] - feature_frame["low"]) / feature_frame["close"].replace(0, np.nan)
    ) * 100

    feature_frame["expected_return_target"] = (
        grouped["close"].shift(-prediction_horizon_days) / feature_frame["close"] - 1
    ) * 100
    feature_frame["drawdown_target"] = grouped["close"].transform(
        lambda series: _future_drawdown(series, prediction_horizon_days)
    )
    feature_frame["drawdown_flag"] = (
        feature_frame["drawdown_target"] <= drawdown_threshold * 100
    ).astype(int)

    feature_frame["volatility_value"] = feature_frame["volatility_20d"].fillna(0.0)
    feature_frame["liquidity_value"] = vol_avg_20.fillna(feature_frame["volume"]).fillna(0.0)
    feature_frame = feature_frame.replace([np.inf, -np.inf], np.nan)
    feature_frame[FEATURE_COLUMNS] = feature_frame[FEATURE_COLUMNS].fillna(0.0)
    return feature_frame.reset_index(drop=True)
