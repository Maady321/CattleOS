import redis
import logging
from typing import List, Optional, Any, Dict
from app.core.config import settings

logger = logging.getLogger(__name__)
redis_client = redis.from_url(settings.REDIS_URL)

class CacheManager:
    """
    Unified Cache Manager with Tenant Isolation and Tagging.
    Standard: v{APP_VERSION}:{farm_id}:{namespace}:{resource_id}:{tag}
    """
    APP_VERSION = "1"
    
    # TTL Standards (in seconds)
    TTL_SHORT = 300      # 5 min (Frequently changing)
    TTL_MEDIUM = 3600    # 1 hour (General data)
    TTL_LONG = 86400     # 24 hours (Reference data)
    TTL_STATIC = 604800  # 7 days (Settings/Config)

    def __init__(self, farm_id: str):
        self.farm_id = farm_id

    def _generate_key(self, namespace: str, resource_id: str, tag: str = None) -> str:
        key = f"v{self.APP_VERSION}:{self.farm_id}:{namespace}:{resource_id}"
        if tag:
            key += f":{tag}"
        return key

    def get(self, namespace: str, resource_id: str) -> Optional[str]:
        key = self._generate_key(namespace, resource_id)
        return redis_client.get(key)

    def set(self, namespace: str, resource_id: str, value: Any, ttl: int = TTL_MEDIUM, tags: List[str] = None):
        key = self._generate_key(namespace, resource_id)
        redis_client.setex(key, ttl, value)
        
        # Handle Cache Tagging for bulk invalidation
        if tags:
            for tag in tags:
                tag_key = f"tag:{self.farm_id}:{tag}"
                redis_client.sadd(tag_key, key)
                redis_client.expire(tag_key, ttl) # Tag set expires with data

    def invalidate(self, namespace: str, resource_id: str):
        key = self._generate_key(namespace, resource_id)
        redis_client.delete(key)

    def invalidate_by_tag(self, tag: str):
        """
        Bulk invalidation using tags (e.g. invalidate all 'milk_logs' for this farm).
        """
        tag_key = f"tag:{self.farm_id}:{tag}"
        keys_to_delete = redis_client.smembers(tag_key)
        
        if keys_to_delete:
            # Batch delete
            redis_client.delete(*keys_to_delete)
            redis_client.delete(tag_key)
            logger.info(f"Invalidated {len(keys_to_delete)} keys for tag: {tag}")

    def get_metrics(self) -> Dict[str, Any]:
        info = redis_client.info()
        return {
            "used_memory": info.get("used_memory_human"),
            "hits": info.get("keyspace_hits"),
            "misses": info.get("keyspace_misses"),
            "hit_rate": info.get("keyspace_hits") / (info.get("keyspace_hits") + info.get("keyspace_misses")) if (info.get("keyspace_hits") + info.get("keyspace_misses")) > 0 else 0
        }
