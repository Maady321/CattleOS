import json
import logging
from typing import Any, Callable, Dict, List
import redis
from app.core.config import settings

logger = logging.getLogger(__name__)
redis_client = redis.from_url(settings.REDIS_URL)

class EventBus:
    """
    Distributed event bus for cross-domain communication using Redis Pub/Sub.
    Enables loose coupling between Cattle, Billing, Insurance, etc.
    """
    
    @staticmethod
    def publish(event_name: str, payload: Dict[str, Any]):
        """
        Publishes an event to the global bus.
        """
        message = {
            "event": event_name,
            "payload": payload,
            "timestamp": str(datetime.utcnow())
        }
        redis_client.publish("cattleos_events", json.dumps(message))
        logger.info(f"Published event: {event_name}")

    @staticmethod
    def subscribe(event_name: str, handler: Callable[[Dict[str, Any]], None]):
        """
        In a production env, this would be handled by a dedicated background worker
        listening to the 'cattleos_events' channel.
        """
        pass

# Example Usage:
# EventBus.publish("CATTLE_DEATH", {"cattle_id": "...", "farm_id": "..."})
