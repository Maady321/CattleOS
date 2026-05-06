from app.core.idempotency import idempotent_task
from app.core.locks import distributed_lock
from app.services.billing import BillingService
from app.db.session import SessionLocal
import logging

logger = logging.getLogger(__name__)

# @celery_app.task(bind=True, max_retries=3)
@idempotent_task(ttl=86400) # Ensure 24h idempotency
def process_subscription_payment_task(farm_id: str, plan_id: str, idempotency_key: str):
    """
    Critical billing job with distributed locking and idempotency.
    """
    db = SessionLocal()
    try:
        # 1. Distributed lock to prevent race conditions on the same farm
        with distributed_lock(f"billing:farm:{farm_id}", timeout=60):
            service = BillingService(db)
            result = service.create_subscription(farm_id, plan_id)
            return {"status": "success", "sub_id": str(result.id)}
    except Exception as e:
        logger.error(f"Billing task failed: {e}")
        raise e
    finally:
        db.close()

# @celery_app.task
@idempotent_task(ttl=3600)
def send_notification_task(user_id: str, message: str, idempotency_key: str):
    """
    Ensures a notification is only sent once even if retried.
    """
    # Logic to send via WhatsApp/SMS
    return {"status": "sent"}
