import logging
import json
import redis
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.messaging import MessageLog, MessageStatus, MessageProvider, WorkflowRule, UserMessagingPreference
from app.core.config import settings

logger = logging.getLogger(__name__)

# Assuming Redis is used for rate limiting and dedupe
redis_client = redis.from_url(settings.REDIS_URL)

class MessagingService:
    def __init__(self, db: Session):
        self.db = db

    def send_workflow_message(self, farm_id: UUID, user_id: UUID, trigger_event: str, context: Dict[str, Any], idempotency_key: str = None):
        """
        Main entry point for workflow messages.
        Checks rules, preferences, quiet hours, and then dispatches.
        """
        # 1. Deduplication check
        if idempotency_key and redis_client.get(f"msg_idempotency:{idempotency_key}"):
            logger.info(f"Duplicate message suppressed: {idempotency_key}")
            return None

        # 2. Get user preferences
        prefs = self.db.query(UserMessagingPreference).filter(
            UserMessagingPreference.user_id == user_id,
            UserMessagingPreference.farm_id == farm_id
        ).first()
        
        if not prefs or not prefs.whatsapp_enabled:
            logger.info(f"User {user_id} has disabled WhatsApp notifications.")
            return None

        # 3. Find active rule for event
        rule = self.db.query(WorkflowRule).filter(
            WorkflowRule.farm_id == farm_id,
            WorkflowRule.trigger_event == trigger_event,
            WorkflowRule.is_active == True
        ).first()
        
        if not rule:
            logger.warning(f"No active rule found for event: {trigger_event}")
            return None

        # 4. Check Quiet Hours
        if self._is_in_quiet_hours(rule):
            logger.info("Inside quiet hours. Message delayed.")
            # In production, we would reschedule this via Celery with an eta
            return None

        # 5. Resolve Template (Multilingual)
        template_id = rule.template_name
        lang = prefs.language_preference or "en"
        content = self._resolve_template(template_id, lang, context)

        # 6. Send via WhatsApp
        log = MessageLog(
            farm_id=farm_id,
            user_id=user_id,
            provider=MessageProvider.WHATSAPP,
            to_number=context.get("phone_number"),
            content=content,
            template_id=template_id,
            workflow_rule_id=rule.id,
            idempotency_key=idempotency_key,
            status=MessageStatus.PENDING
        )
        self.db.add(log)
        self.db.commit()

        # 7. Rate Limiting (Token Bucket per Farm)
        if not self._check_rate_limit(farm_id):
            log.status = MessageStatus.REJECTED
            log.error_message = "Rate limit exceeded"
            self.db.commit()
            return None

        try:
            # Mock WhatsApp API Call
            provider_id = self._dispatch_to_whatsapp(context.get("phone_number"), template_id, lang, context)
            log.provider_message_id = provider_id
            log.status = MessageStatus.SENT
            log.sent_at = datetime.utcnow()
            
            # Set idempotency expiry
            if idempotency_key:
                redis_client.setex(f"msg_idempotency:{idempotency_key}", 86400, "1")
                
        except Exception as e:
            logger.error(f"WhatsApp dispatch failed: {e}")
            log.status = MessageStatus.FAILED
            log.error_message = str(e)
            
            # Fallback to SMS if enabled
            if prefs.sms_fallback_enabled:
                self._fallback_to_sms(log, context)
        
        self.db.commit()
        return log

    def _is_in_quiet_hours(self, rule: WorkflowRule) -> bool:
        if not rule.quiet_hours_start or not rule.quiet_hours_end:
            return False
        now = datetime.now().time()
        start = datetime.strptime(rule.quiet_hours_start, "%H:%M").time()
        end = datetime.strptime(rule.quiet_hours_end, "%H:%M").time()
        
        if start < end:
            return start <= now <= end
        else: # Overnights
            return now >= start or now <= end

    def _resolve_template(self, template_id: str, lang: str, context: Dict[str, Any]) -> str:
        # Template library (English + Malayalam)
        templates = {
            "VACCINATION_DUE": {
                "en": "Reminder: {cattle_name} is due for {vaccine_name} on {date}. Please ensure timely administration.",
                "ml": "ഓർമ്മപ്പെടുത്തൽ: {cattle_name}-ന് {date}-ൽ {vaccine_name} നൽകേണ്ടതുണ്ട്. ദയവായി കൃത്യസമയത്ത് ഇത് ഉറപ്പാക്കുക."
            },
            "MILK_ANOMALY": {
                "en": "Alert: Unusual milk yield drop for {cattle_name}. Current: {yield}L (Avg: {avg}L). Check health logs.",
                "ml": "അറിയിപ്പ്: {cattle_name}-ന്റെ പാൽ ഉൽപാദനത്തിൽ അസ്വാഭാവികമായ കുറവ്. നിലവിൽ: {yield}L (ശരാശരി: {avg}L). ആരോഗ്യം പരിശോധിക്കുക."
            }
        }
        tpl = templates.get(template_id, {}).get(lang, "Notification from CattleOS")
        return tpl.format(**context)

    def _check_rate_limit(self, farm_id: UUID) -> bool:
        key = f"rate_limit:farm:{farm_id}"
        count = redis_client.incr(key)
        if count == 1:
            redis_client.expire(key, 60) # 1 minute window
        return count <= 50 # 50 msgs per minute per farm

    def _dispatch_to_whatsapp(self, phone: str, template: str, lang: str, context: Dict[str, Any]) -> str:
        # Actual logic would use `requests.post` to Meta Business API
        logger.info(f"Dispatched WhatsApp message to {phone}")
        return f"wa_{uuid.uuid4().hex[:10]}"

    def _fallback_to_sms(self, original_log: MessageLog, context: Dict[str, Any]):
        logger.info(f"Falling back to SMS for log {original_log.id}")
        # Logic to send via Twilio/etc
        pass

    def send_emergency_alert(self, farm_id: UUID, message: str, phone_numbers: List[str]):
        """
        Broadcasts an emergency message bypassing quiet hours and rate limits (to an extent).
        """
        for phone in phone_numbers:
            # Emergency bypass logic
            self._dispatch_to_whatsapp(phone, "EMERGENCY_TEMPLATE", "en", {"message": message})
            # Also send SMS immediately as redundancy
            self._dispatch_to_sms(phone, message)

    def _dispatch_to_sms(self, phone: str, message: str):
        logger.info(f"Dispatching emergency SMS to {phone}")
        # Twilio call
        pass
