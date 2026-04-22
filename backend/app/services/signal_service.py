from __future__ import annotations

from typing import Any

from app.core.config import Settings
from app.schemas.signal import SignalResponse
from app.schemas.stock import PricePoint, StockDetailResponse
from app.services.data_service import DataService
from app.services.llm_service import LLMService
from app.services.ml_service import MLService


class SignalService:
    def __init__(
        self,
        settings: Settings,
        data_service: DataService,
        ml_service: MLService,
        llm_service: LLMService,
    ) -> None:
        self.settings = settings
        self.data_service = data_service
        self.ml_service = ml_service
        self.llm_service = llm_service

    def _signal_from_snapshot(self, snapshot: dict[str, Any]) -> str:
        expected_return = float(snapshot["predicted_return_5d"])
        risk_score = float(snapshot["risk_score"])
        liquidity_value = float(snapshot["liquidity_value"])

        illiquidity_penalty = 1.0 if liquidity_value <= 0 else 0.0
        adjusted_risk = risk_score + illiquidity_penalty

        if (
            expected_return >= self.settings.buy_return_threshold
            and adjusted_risk <= self.settings.buy_risk_threshold
        ):
            return "BUY"
        if (
            expected_return >= self.settings.hold_return_threshold
            and adjusted_risk <= self.settings.hold_risk_threshold
        ):
            return "HOLD"
        return "AVOID"

    def get_signals(self) -> list[SignalResponse]:
        prediction_frame = self.ml_service.predict(self.data_service.get_feature_frame())
        signals: list[SignalResponse] = []
        for row in prediction_frame.to_dict(orient="records"):
            signal = self._signal_from_snapshot(row)
            signals.append(
                SignalResponse(
                    ticker=str(row["ticker"]),
                    signal=signal,
                    expected_return_5d=round(float(row["predicted_return_5d"]), 2),
                    risk_score=round(float(row["risk_score"]), 2),
                    confidence=round(float(row["confidence"]), 2),
                )
            )

        return sorted(signals, key=lambda item: (item.signal != "BUY", -item.expected_return_5d))

    def get_stock_detail(self, ticker: str) -> StockDetailResponse:
        upper_ticker = ticker.upper()
        prediction_frame = self.ml_service.predict(self.data_service.get_feature_frame())
        row = prediction_frame.loc[prediction_frame["ticker"] == upper_ticker]
        if row.empty:
            raise KeyError(f"Ticker {upper_ticker} not found")

        snapshot = row.iloc[0].to_dict()
        signal = self._signal_from_snapshot(snapshot)
        metadata = self.data_service.get_stock_metadata(upper_ticker)
        volatility = self.data_service.describe_volatility(upper_ticker)
        liquidity = self.data_service.describe_liquidity(upper_ticker)
        explanation = self.llm_service.generate_explanation(
            {
                "ticker": upper_ticker,
                "sector": metadata["sector"],
                "signal": signal,
                "expected_return": float(snapshot["predicted_return_5d"]),
                "risk_score": float(snapshot["risk_score"]),
                "volatility": volatility,
                "liquidity": liquidity,
                "confidence": float(snapshot["confidence"]),
            }
        )

        return StockDetailResponse(
            ticker=upper_ticker,
            price_history=[PricePoint(**point) for point in self.data_service.get_price_history(upper_ticker)],
            expected_return=round(float(snapshot["predicted_return_5d"]), 2),
            risk_score=round(float(snapshot["risk_score"]), 2),
            volatility=volatility,
            liquidity=liquidity,
            explanation=explanation,
        )
