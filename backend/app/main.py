from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models.market  # noqa: F401
from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.db.base import Base
from app.db.session import AsyncSessionFactory, engine
from app.repositories.stock_repository import StockRepository
from app.services.data_service import DataService
from app.services.llm_service import LLMService
from app.services.ml_service import MLService
from app.services.portfolio_service import PortfolioService
from app.services.signal_service import SignalService
from app.utils.rate_limit import InMemoryRateLimiter

settings = get_settings()
configure_logging(settings)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    data_service = DataService(settings)
    ml_service = MLService(settings)
    llm_service = LLMService()
    repository = StockRepository(AsyncSessionFactory)

    await asyncio.to_thread(data_service.initialize)

    try:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
        logger.info("database_ready")
    except Exception as error:  # noqa: BLE001
        logger.warning("database_unavailable", extra={"error": str(error)})

    if settings.bootstrap_database:
        try:
            await data_service.bootstrap_database(repository)
        except Exception as error:  # noqa: BLE001
            logger.warning("database_bootstrap_failed", extra={"error": str(error)})

    if settings.auto_train_models:
        asyncio.create_task(asyncio.to_thread(ml_service.ensure_models, data_service.get_feature_frame()))

    app.state.data_service = data_service
    app.state.ml_service = ml_service
    app.state.signal_service = SignalService(settings, data_service, ml_service, llm_service)
    app.state.portfolio_service = PortfolioService(data_service, ml_service)
    app.state.rate_limiter = InMemoryRateLimiter(settings.rate_limit_per_minute)

    yield

    await engine.dispose()


app = FastAPI(
    title=settings.project_name,
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, include_in_schema=False)
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
