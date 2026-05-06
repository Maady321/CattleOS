from typing import Dict, Any
from uuid import UUID
from app.db.session import SessionLocal
from app.services.messaging import MessagingService
from app.models.logs import Vaccination, Medicine, MilkLog
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Assuming Celery is initialized elsewhere
# from app.core.celery_app import celery_app

def process_reminders():
    """
    Periodic task (run every hour) to scan for upcoming events and trigger workflows.
    """
    db = SessionLocal()
    try:
        service = MessagingService(db)
        now = datetime.utcnow()
        
        # 1. Vaccination Reminders (24 hours before)
        target_date = (now + timedelta(days=1)).date()
        vaccinations = db.query(Vaccination).filter(
            Vaccination.next_due_date >= target_date,
            Vaccination.next_due_date < target_date + timedelta(days=1)
        ).all()
        
        for v in vaccinations:
            # Trigger workflow
            service.send_workflow_message(
                farm_id=v.farm_id,
                user_id=v.cattle.farm.owner_id, # Assuming farm has owner_id
                trigger_event="VACCINATION_DUE",
                context={
                    "cattle_name": v.cattle.name or v.cattle.tag_id,
                    "vaccine_name": v.vaccine_name,
                    "date": v.next_due_date.strftime("%Y-%m-%d"),
                    "phone_number": "+910000000000" # Logic to get user phone
                },
                idempotency_key=f"vacc_{v.id}_{target_date}"
            )
            
        # 2. Milk Anomaly Alerts
        # Logic: Compare last log with average
        # ...
        
    finally:
        db.close()

def handle_whatsapp_webhook(payload: Dict[str, Any]):
    """
    Handles status updates from WhatsApp Business API.
    """
    db = SessionLocal()
    try:
        # Example payload structure from Meta
        entry = payload.get("entry", [{}])[0]
        changes = entry.get("changes", [{}])[0]
        value = changes.get("value", {})
        statuses = value.get("statuses", [])
        
        for status in statuses:
            wa_id = status.get("id")
            new_status = status.get("status").upper() # DELIVERED, READ, FAILED
            
            from app.models.messaging import MessageLog, MessageStatus
            log = db.query(MessageLog).filter(MessageLog.provider_message_id == wa_id).first()
            if log:
                log.status = MessageStatus(new_status)
                if new_status == "READ":
                    log.read_at = datetime.utcnow()
                elif new_status == "DELIVERED":
                    log.delivered_at = datetime.utcnow()
                db.commit()
    finally:
        db.close()
