from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends
from fastapi.concurrency import run_in_threadpool

from app.api.dependencies import enforce_rate_limit, get_data_service, get_ml_service, get_signal_service
from app.schemas.signal import SignalResponse
from app.services.data_service import DataService
from app.services.ml_service import MLService
from app.services.signal_service import SignalService

router = APIRouter()


@router.get("/signals", response_model=list[SignalResponse], dependencies=[Depends(enforce_rate_limit)])
async def list_signals(
    background_tasks: BackgroundTasks,
    signal_service: SignalService = Depends(get_signal_service),
    data_service: DataService = Depends(get_data_service),
    ml_service: MLService = Depends(get_ml_service),
) -> list[SignalResponse]:
    if ml_service.has_artifacts() and ml_service.is_stale():
        background_tasks.add_task(ml_service.train, data_service.get_feature_frame())
    return await run_in_threadpool(signal_service.get_signals)
