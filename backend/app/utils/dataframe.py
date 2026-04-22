from __future__ import annotations

from pathlib import Path

import pandas as pd


def coerce_numeric(series: pd.Series) -> pd.Series:
    cleaned = (
        series.astype(str)
        .str.replace(",", "", regex=False)
        .str.replace("%", "", regex=False)
        .replace({"-": None, "nan": None, "None": None})
    )
    return pd.to_numeric(cleaned, errors="coerce")


def safe_read_csv(path: Path) -> pd.DataFrame:
    return pd.read_csv(path).rename(columns=lambda value: value.strip())


def min_max_scale(value: float, min_value: float, max_value: float) -> float:
    if max_value == min_value:
        return 0.0
    return (value - min_value) / (max_value - min_value)
