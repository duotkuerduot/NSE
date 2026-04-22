from __future__ import annotations

import numpy as np
import pandas as pd

from app.schemas.portfolio import PortfolioAnalysisResponse, PortfolioBreakdownItem
from app.services.data_service import DataService
from app.services.ml_service import MLService


class PortfolioService:
    def __init__(self, data_service: DataService, ml_service: MLService) -> None:
        self.data_service = data_service
        self.ml_service = ml_service

    def analyze(self, tickers: list[str]) -> PortfolioAnalysisResponse:
        normalized = list(dict.fromkeys(ticker.upper() for ticker in tickers))
        feature_frame = self.data_service.get_feature_frame()
        prediction_frame = self.ml_service.predict(feature_frame)
        selected = prediction_frame.loc[prediction_frame["ticker"].isin(normalized)].copy()
        if selected.empty:
            raise KeyError("No requested tickers are available in the NSE universe.")

        price_frame = feature_frame.loc[feature_frame["ticker"].isin(normalized), ["date", "ticker", "close", "sector"]]
        pivot = price_frame.pivot_table(index="date", columns="ticker", values="close").sort_index()
        returns = pivot.pct_change().dropna(how="all").fillna(0.0)
        portfolio_returns = returns.mean(axis=1) if not returns.empty else pd.Series(dtype=float)

        historical_vol = float(portfolio_returns.std() * np.sqrt(252) * 100) if not portfolio_returns.empty else 0.0
        model_risk = float(selected["risk_score"].mean())
        risk = min(10.0, round(0.6 * (historical_vol / 4 if historical_vol else 0) + 0.4 * model_risk, 2))

        correlation_matrix = returns.corr().fillna(0.0) if not returns.empty else pd.DataFrame()
        if correlation_matrix.empty or len(correlation_matrix.columns) == 1:
            avg_abs_corr = 0.0
        else:
            upper_mask = np.triu(np.ones(correlation_matrix.shape), k=1).astype(bool)
            upper_values = correlation_matrix.where(upper_mask).stack().abs()
            avg_abs_corr = float(upper_values.mean()) if not upper_values.empty else 0.0

        sector_weights = (
            price_frame.groupby("sector")["ticker"]
            .nunique()
            .div(len(selected))
            .sort_values(ascending=False)
        )
        hhi = float((sector_weights.pow(2)).sum()) if not sector_weights.empty else 1.0
        diversification_score = round(
            max(0.0, min(10.0, ((1 - avg_abs_corr) * 0.6 + (1 - hhi) * 0.4) * 10)),
            2,
        )

        breakdown_rows = []
        for sector, sector_frame in (
            price_frame.groupby("sector", sort=True) if not price_frame.empty else []
        ):
            sector_tickers = sorted(sector_frame["ticker"].unique().tolist())
            sector_prediction = selected.loc[selected["ticker"].isin(sector_tickers)]
            breakdown_rows.append(
                PortfolioBreakdownItem(
                    sector=str(sector),
                    weight=round((len(sector_tickers) / len(selected)) * 100, 2),
                    tickers=sector_tickers,
                    average_risk=round(float(sector_prediction["risk_score"].mean()), 2),
                )
            )

        recommendations = self._build_recommendations(
            normalized,
            risk,
            diversification_score,
            avg_abs_corr,
            breakdown_rows,
        )

        return PortfolioAnalysisResponse(
            risk=risk,
            diversification_score=diversification_score,
            recommendations=recommendations,
            breakdown=breakdown_rows,
        )

    def _build_recommendations(
        self,
        tickers: list[str],
        risk: float,
        diversification_score: float,
        avg_abs_corr: float,
        breakdown: list[PortfolioBreakdownItem],
    ) -> str:
        recommendations: list[str] = []
        if len(tickers) < 3:
            recommendations.append(
                "Portfolio is concentrated in too few names; add more NSE listings to reduce single-name shock risk."
            )
        if risk >= 7:
            recommendations.append(
                "Aggregate portfolio risk is elevated. Trim the most volatile holdings or pair them with lower-beta banks and utilities."
            )
        if diversification_score <= 4.5:
            recommendations.append(
                "Diversification is weak. Sector exposures are clustered and should be rebalanced toward less-correlated names."
            )
        if avg_abs_corr >= 0.65:
            recommendations.append(
                "Historical co-movement is high across the basket, so drawdowns may arrive together during stress periods."
            )
        dominant_sector = max(breakdown, key=lambda item: item.weight, default=None)
        if dominant_sector and dominant_sector.weight >= 50:
            recommendations.append(
                f"The portfolio is overexposed to {dominant_sector.sector} at {dominant_sector.weight:.0f}% weight. Consider spreading capital across additional sectors."
            )
        if not recommendations:
            recommendations.append(
                "Portfolio construction looks balanced with acceptable risk and correlation. Maintain exposure and review signals for incremental upgrades."
            )

        return " ".join(recommendations)
