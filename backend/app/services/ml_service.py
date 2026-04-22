from __future__ import annotations

from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

import pandas as pd

from app.core.config import Settings
from app.core.logging import get_logger
from app.ml.predict import load_artifacts, predict_latest
from app.ml.train import train_models

logger = get_logger(__name__)


class MLService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.artifact_dir = Path(settings.artifact_dir)
        self._metadata: dict[str, Any] | None = None

    def has_artifacts(self) -> bool:
        return all(
            (self.artifact_dir / file_name).exists()
            for file_name in ("return_model.joblib", "risk_model.joblib", "metadata.json")
        )

    def is_stale(self) -> bool:
        if not self.has_artifacts():
            return True
        metadata = self.get_metadata()
        trained_at = datetime.fromisoformat(metadata["trained_at"])
        return datetime.now(UTC) - trained_at > timedelta(hours=self.settings.model_retrain_hours)

    def get_metadata(self) -> dict[str, Any]:
        if self._metadata is None:
            self._metadata = load_artifacts(self.artifact_dir)["metadata"]
        return self._metadata

    def ensure_models(self, feature_frame: pd.DataFrame) -> dict[str, Any]:
        if self.has_artifacts() and not self.is_stale():
            return self.get_metadata()

        logger.info("training_models_on_demand")
        self._metadata = train_models(feature_frame, self.artifact_dir)
        return self._metadata

    def train(self, feature_frame: pd.DataFrame) -> dict[str, Any]:
        self._metadata = train_models(feature_frame, self.artifact_dir)
        return self._metadata

    def predict(self, feature_frame: pd.DataFrame, refresh_if_stale: bool = False) -> pd.DataFrame:
        if not self.has_artifacts():
            self.ensure_models(feature_frame)
        elif refresh_if_stale and self.is_stale():
            self.train(feature_frame)

        prediction_frame = predict_latest(feature_frame, self.artifact_dir)

        max_abs_return = max(abs(prediction_frame["predicted_return_5d"]).max(), 1.0)
        prediction_frame["confidence"] = (
            55
            + (prediction_frame["predicted_return_5d"].abs() / max_abs_return) * 25
            + prediction_frame["risk_probability"].sub(0.5).abs() * 40
        ).clip(50, 99)
        return prediction_frame
