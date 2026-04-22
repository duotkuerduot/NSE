from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from app.ml.features import FEATURE_COLUMNS


def load_artifacts(artifact_dir: Path) -> dict[str, Any]:
    return_model = joblib.load(artifact_dir / "return_model.joblib")
    risk_model = joblib.load(artifact_dir / "risk_model.joblib")
    with (artifact_dir / "metadata.json").open("r", encoding="utf-8") as handle:
        metadata = json.load(handle)

    return {
        "return_model": return_model,
        "risk_model": risk_model,
        "metadata": metadata,
    }


def predict_latest(feature_frame: pd.DataFrame, artifact_dir: Path) -> pd.DataFrame:
    artifacts = load_artifacts(artifact_dir)
    latest = (
        feature_frame.sort_values(["ticker", "date"])
        .groupby("ticker", as_index=False)
        .tail(1)
        .copy()
    )
    latest["predicted_return_5d"] = artifacts["return_model"].predict(latest[FEATURE_COLUMNS])
    latest["risk_probability"] = artifacts["risk_model"].predict_proba(latest[FEATURE_COLUMNS])[:, 1]
    latest["risk_score"] = np.clip(latest["risk_probability"] * 10, 0, 10)
    return latest
