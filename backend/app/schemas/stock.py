from pydantic import BaseModel, ConfigDict


class PricePoint(BaseModel):
    date: str
    price: float


class StockDetailResponse(BaseModel):
    ticker: str
    price_history: list[PricePoint]
    expected_return: float
    risk_score: float
    volatility: str
    liquidity: str
    explanation: str

    model_config = ConfigDict(from_attributes=True)
