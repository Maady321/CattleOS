import time
import uuid
import redis
from contextlib import contextmanager
from app.core.config import settings

redis_client = redis.from_url(settings.REDIS_URL)

class DistributedLock:
    def __init__(self, name: str, timeout: int = 30):
        self.name = f"lock:{name}"
        self.timeout = timeout
        self.token = str(uuid.uuid4())

    def acquire(self) -> bool:
        """
        Acquire a non-blocking lock.
        """
        return bool(redis_client.set(self.name, self.token, nx=True, ex=self.timeout))

    def release(self):
        """
        Release the lock only if we own it (safe release).
        """
        # Lua script for atomic check-and-delete
        script = """
        if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
        else
            return 0
        end
        """
        redis_client.eval(script, 1, self.name, self.token)

@contextmanager
def distributed_lock(name: str, timeout: int = 30):
    lock = DistributedLock(name, timeout)
    if not lock.acquire():
        raise RuntimeError(f"Could not acquire lock: {name}")
    try:
        yield
    finally:
        lock.release()
