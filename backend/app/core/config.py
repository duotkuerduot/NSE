from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = "NSE Intelligence API"
    api_v1_prefix: str = "/api/v1"
    environment: Literal["local", "development", "staging", "production"] = "local"
    debug: bool = False
    log_level: str = "INFO"
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    )

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/nse_intelligence"
    redis_url: str | None = None

    raw_data_dir: Path = Field(
        default_factory=lambda: Path(__file__).resolve().parents[3] / "NSE 2007-2025 Data",
    )
    local_data_dir: Path = Field(
        default_factory=lambda: Path(__file__).resolve().parents[2] / "data",
    )
    artifact_dir: Path = Field(
        default_factory=lambda: Path(__file__).resolve().parents[2] / "artifacts",
    )

    bootstrap_database: bool = False
    auto_train_models: bool = True
    model_retrain_hours: int = 24
    prediction_horizon_days: int = 5
    risk_drawdown_threshold: float = -0.05

    buy_return_threshold: float = 2.5
    hold_return_threshold: float = 0.75
    buy_risk_threshold: float = 4.5
    hold_risk_threshold: float = 6.5

    rate_limit_per_minute: int = 120

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.local_data_dir.mkdir(parents=True, exist_ok=True)
    settings.artifact_dir.mkdir(parents=True, exist_ok=True)
    return settings
