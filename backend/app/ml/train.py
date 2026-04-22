from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from xgboost import XGBClassifier, XGBRegressor

from app.core.logging import get_logger
from app.core.config import get_settings
from app.services.data_service import DataService
from app.ml.features import FEATURE_COLUMNS

logger = get_logger(__name__)


def _time_split(frame: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    ordered = frame.sort_values("date")
    split_index = max(int(len(ordered) * 0.8), 1)
    train_frame = ordered.iloc[:split_index]
    valid_frame = ordered.iloc[split_index:] if split_index < len(ordered) else ordered.iloc[-1:]
    return train_frame, valid_frame


def train_models(
    feature_frame: pd.DataFrame,
    artifact_dir: Path,
) -> dict[str, Any]:
    training_frame = feature_frame.dropna(subset=["expected_return_target", "drawdown_flag"]).copy()
    if training_frame.empty:
        raise ValueError("Training frame is empty after filtering targets.")

    train_frame, valid_frame = _time_split(training_frame)
    x_train = train_frame[FEATURE_COLUMNS]
    x_valid = valid_frame[FEATURE_COLUMNS]

    return_model = XGBRegressor(
        n_estimators=250,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        objective="reg:squarederror",
        random_state=42,
    )
    risk_model = XGBClassifier(
        n_estimators=220,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="logloss",
        random_state=42,
    )

    return_model.fit(x_train, train_frame["expected_return_target"])
    risk_model.fit(x_train, train_frame["drawdown_flag"])

    return_pred = return_model.predict(x_valid)
    risk_pred = risk_model.predict_proba(x_valid)[:, 1]

    metrics = {
        "trained_at": datetime.now(UTC).isoformat(),
        "feature_columns": FEATURE_COLUMNS,
        "return_mae": float(np.mean(np.abs(valid_frame["expected_return_target"] - return_pred))),
        "risk_positive_rate": float(valid_frame["drawdown_flag"].mean()),
        "risk_probability_mean": float(np.mean(risk_pred)),
    }

    artifact_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(return_model, artifact_dir / "return_model.joblib")
    joblib.dump(risk_model, artifact_dir / "risk_model.joblib")
    with (artifact_dir / "metadata.json").open("w", encoding="utf-8") as handle:
        json.dump(metrics, handle, indent=2)

    logger.info("trained_models", extra={"metrics": metrics})
    return metrics


if __name__ == "__main__":
    settings = get_settings()
    data_service = DataService(settings)
    data_service.initialize()
    result = train_models(data_service.get_feature_frame(), settings.artifact_dir)
    print(json.dumps(result, indent=2))
