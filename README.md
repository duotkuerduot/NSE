# NSE

Integrated Nairobi Securities Exchange AI platform with:

- `frontend`: Next.js fintech dashboard on `http://localhost:3000`
- `backend`: FastAPI ML API on `http://localhost:8000`

## Full Stack Launch

```bash
docker compose up --build
```

## Frontend Only

```bash
cd frontend
npm install
npm run dev
```

## Backend Only

```bash
cd backend
uvicorn app.main:app --reload
```
