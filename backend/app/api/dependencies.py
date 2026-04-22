from __future__ import annotations

from fastapi import HTTPException, Request, status

from app.services.data_service import DataService
from app.services.ml_service import MLService
from app.services.portfolio_service import PortfolioService
from app.services.signal_service import SignalService
from app.utils.rate_limit import InMemoryRateLimiter


def get_signal_service(request: Request) -> SignalService:
    return request.app.state.signal_service


def get_portfolio_service(request: Request) -> PortfolioService:
    return request.app.state.portfolio_service


def get_data_service(request: Request) -> DataService:
    return request.app.state.data_service


def get_ml_service(request: Request) -> MLService:
    return request.app.state.ml_service


def enforce_rate_limit(request: Request) -> None:
    limiter: InMemoryRateLimiter = request.app.state.rate_limiter
    client = request.client.host if request.client else "anonymous"
    if not limiter.allow(client):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please retry shortly.",
        )
