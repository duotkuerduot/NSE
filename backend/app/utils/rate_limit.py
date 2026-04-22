from __future__ import annotations

from collections import defaultdict, deque
from datetime import UTC, datetime, timedelta


class InMemoryRateLimiter:
    def __init__(self, limit: int, window_seconds: int = 60) -> None:
        self.limit = limit
        self.window = timedelta(seconds=window_seconds)
        self.requests: dict[str, deque[datetime]] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = datetime.now(UTC)
        history = self.requests[key]
        while history and now - history[0] > self.window:
            history.popleft()
        if len(history) >= self.limit:
            return False
        history.append(now)
        return True
