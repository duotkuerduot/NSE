# NSE Intelligence Backend

Production-oriented FastAPI backend for an AI-powered stock intelligence platform focused on the Nairobi Securities Exchange.

## Features

- FastAPI v1 API with frontend-compatible endpoints
- SQLAlchemy models for PostgreSQL
- Pandas/Numpy feature engineering
- XGBoost return and risk models
- Template-based AI explanation layer
- Portfolio analytics with correlation and diversification scoring
- Optional PostgreSQL bootstrap and background model retraining
- Docker-ready local stack with Postgres and Redis

## Run Locally

1. Create a virtual environment and install dependencies.
2. Copy `.env.example` to `.env` and adjust values if needed.
3. Start the API:

```bash
uvicorn app.main:app --reload
```

## Docker

```bash
docker compose up --build
```
