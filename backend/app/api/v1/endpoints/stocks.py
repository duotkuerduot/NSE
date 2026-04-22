from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool

from app.api.dependencies import enforce_rate_limit, get_signal_service
from app.schemas.stock import StockDetailResponse
from app.services.signal_service import SignalService

router = APIRouter()


@router.get(
    "/stock/{ticker}",
    response_model=StockDetailResponse,
    dependencies=[Depends(enforce_rate_limit)],
)
async def get_stock(
    ticker: str,
    signal_service: SignalService = Depends(get_signal_service),
) -> StockDetailResponse:
    try:
        return await run_in_threadpool(signal_service.get_stock_detail, ticker)
    except KeyError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error
