from app.core.celery_app import celery_app
import logging

logger = logging.getLogger(__name__)

@celery_app.task(name="send_vaccination_reminder")
def send_vaccination_reminder(user_phone: str, cattle_name: str, vaccine_name: str):
    """
    Task to send vaccination reminders via SMS/WhatsApp.
    In production, this would call Twilio or WhatsApp API.
    """
    logger.info(f"Sending reminder to {user_phone} for {cattle_name}'s {vaccine_name} vaccination.")
    # Integration logic here
    return True
