from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool

from app.api.dependencies import enforce_rate_limit, get_portfolio_service
from app.schemas.portfolio import PortfolioAnalysisRequest, PortfolioAnalysisResponse
from app.services.portfolio_service import PortfolioService

router = APIRouter()


@router.post(
    "/portfolio/analyze",
    response_model=PortfolioAnalysisResponse,
    dependencies=[Depends(enforce_rate_limit)],
)
async def analyze_portfolio(
    payload: PortfolioAnalysisRequest,
    portfolio_service: PortfolioService = Depends(get_portfolio_service),
) -> PortfolioAnalysisResponse:
    try:
        return await run_in_threadpool(portfolio_service.analyze, payload.stocks)
    except KeyError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error
