from pydantic import BaseModel, ConfigDict


class SignalResponse(BaseModel):
    ticker: str
    signal: str
    expected_return_5d: float
    risk_score: float
    confidence: float

    model_config = ConfigDict(from_attributes=True)
