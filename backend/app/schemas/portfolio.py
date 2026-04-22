from pydantic import BaseModel, ConfigDict, Field


class PortfolioAnalysisRequest(BaseModel):
    stocks: list[str] = Field(default_factory=list, min_length=1)


class PortfolioBreakdownItem(BaseModel):
    sector: str
    weight: float
    tickers: list[str]
    average_risk: float | None = None


class PortfolioAnalysisResponse(BaseModel):
    risk: float
    diversification_score: float
    recommendations: str
    breakdown: list[PortfolioBreakdownItem]

    model_config = ConfigDict(from_attributes=True)
