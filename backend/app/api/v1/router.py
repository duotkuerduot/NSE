from fastapi import APIRouter

from app.api.v1.endpoints import portfolio, signals, stocks

api_router = APIRouter()
api_router.include_router(signals.router, tags=["signals"])
api_router.include_router(stocks.router, tags=["stocks"])
api_router.include_router(portfolio.router, tags=["portfolio"])
