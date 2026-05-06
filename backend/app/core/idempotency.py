import functools
import json
import logging
import redis
from datetime import timedelta
from typing import Any, Callable, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)
redis_client = redis.from_url(settings.REDIS_URL)

class IdempotencyError(Exception):
    pass

class IdempotencyManager:
    def __init__(self, prefix: str = "idempotency"):
        self.prefix = prefix

    def _get_key(self, key: str) -> str:
        return f"{self.prefix}:{key}"

    def start_execution(self, key: str, ttl: int = 3600) -> bool:
        """
        Attempts to mark a task as 'IN_PROGRESS'.
        Returns True if successful, False if already exists.
        """
        full_key = self._get_key(key)
        # Use SET with NX (set if not exists) and EX (expiry)
        success = redis_client.set(full_key, "IN_PROGRESS", nx=True, ex=ttl)
        return bool(success)

    def complete_execution(self, key: str, result: Any, ttl: int = 86400):
        """
        Marks a task as 'COMPLETED' and stores the result.
        """
        full_key = self._get_key(key)
        data = {
            "status": "COMPLETED",
            "result": result,
            "completed_at": str(timedelta(seconds=0)) # Placeholder
        }
        redis_client.setex(full_key, ttl, json.dumps(data))

    def get_result(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Checks if a task was already completed and returns its result.
        """
        full_key = self._get_key(key)
        data = redis_client.get(full_key)
        if data:
            if data == b"IN_PROGRESS":
                return {"status": "IN_PROGRESS"}
            return json.loads(data)
        return None

def idempotent_task(ttl: int = 86400):
    """
    Decorator for Celery tasks to ensure idempotency.
    Expects 'idempotency_key' in kwargs.
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            key = kwargs.get("idempotency_key")
            if not key:
                # If no key, execute normally (not recommended for critical jobs)
                return func(*args, **kwargs)

            manager = IdempotencyManager()
            
            # 1. Check if already executed
            existing = manager.get_result(key)
            if existing:
                if existing["status"] == "COMPLETED":
                    logger.info(f"Task already completed, returning cached result: {key}")
                    return existing["result"]
                elif existing["status"] == "IN_PROGRESS":
                    logger.warning(f"Task execution already in progress: {key}")
                    raise IdempotencyError("Task is already running")

            # 2. Mark as started
            if not manager.start_execution(key, ttl=3600):
                raise IdempotencyError("Concurrent execution detected")

            try:
                # 3. Execute
                result = func(*args, **kwargs)
                # 4. Mark as completed
                manager.complete_execution(key, result, ttl=ttl)
                return result
            except Exception as e:
                # 5. Clean up on failure to allow retries? 
                # Or keep 'FAILED' state? Distributed systems usually allow retry.
                redis_client.delete(manager._get_key(key))
                raise e
                
        return wrapper
    return decorator
