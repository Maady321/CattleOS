import logging
from typing import Any, Dict, List, Optional
import time
from datetime import datetime, timedelta
import redis
from app.core.config import settings

logger = logging.getLogger(__name__)

class TieredCache:
    """
    Optimizes cost by using local memory before hitting Redis.
    Reduces Redis network latency and CPU cost.
    """
    _local_cache: Dict[str, Any] = {}
    _expiry: Dict[str, float] = {}

    @classmethod
    def get(cls, key: str) -> Optional[Any]:
        # 1. Check Local (Level 1)
        if key in cls._local_cache and time.time() < cls._expiry[key]:
            return cls._local_cache[key]
        
        # 2. Level 2 (Redis) - Mocked
        return None

    @classmethod
    def set(cls, key: str, value: Any, ttl_sec: int = 300):
        cls._local_cache[key] = value
        cls._expiry[key] = time.time() + ttl_sec

class BatchJobProcessor:
    """
    Reduces DB IOPS cost by batching small frequent writes.
    Example: Buffering 100 milk logs into 1 transaction.
    """
    _buffer: List[Any] = []
    _last_flush = datetime.utcnow()
    
    @classmethod
    def add_to_batch(cls, item: Any, batch_size: int = 50, flush_interval_sec: int = 300):
        cls._buffer.append(item)
        
        elapsed = (datetime.utcnow() - cls._last_flush).total_seconds()
        
        if len(cls._buffer) >= batch_size or elapsed >= flush_interval_sec:
            cls.flush_to_db()

    @classmethod
    def flush_to_db(cls):
        if not cls._buffer: return
        
        logger.info(f"COST_OP: Flushing {len(cls._buffer)} items to DB in a single transaction.")
        # DB Write Logic here
        cls._buffer = []
        cls._last_flush = datetime.utcnow()
