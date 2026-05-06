import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base, TimestampMixin

class MessageStatus(str, enum.Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    DELIVERED = "DELIVERED"
    READ = "READ"
    FAILED = "FAILED"
    REJECTED = "REJECTED"

class MessageProvider(str, enum.Enum):
    WHATSAPP = "WHATSAPP"
    SMS = "SMS"
    PUSH = "PUSH"

class WorkflowRule(Base, TimestampMixin):
    __tablename__ = "workflow_rules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    trigger_event = Column(String, nullable=False, index=True) # e.g., "VACCINATION_DUE", "MILK_ANOMALY"
    
    condition_json = Column(JSON, default={}) # Rules for when to trigger
    template_name = Column(String, nullable=False)
    template_variants = Column(JSON, nullable=True) # For A/B testing: {"A": "tpl_1", "B": "tpl_2"}
    
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=0)
    
    # Workflow Logic
    delay_seconds = Column(Integer, default=0)
    retry_limit = Column(Integer, default=3)
    escalation_rule = Column(JSON, nullable=True) # e.g. {"after_hours": 2, "action": "SMS_ALERT"}
    
    quiet_hours_start = Column(String, nullable=True) # "22:00"
    quiet_hours_end = Column(String, nullable=True)   # "06:00"

class MessageLog(Base, TimestampMixin):
    __tablename__ = "message_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    provider = Column(SQLEnum(MessageProvider), nullable=False)
    provider_message_id = Column(String, index=True) # ID from WhatsApp/Twilio
    
    to_number = Column(String, nullable=False)
    content = Column(Text)
    template_id = Column(String)
    
    status = Column(SQLEnum(MessageStatus), default=MessageStatus.PENDING, index=True)
    error_message = Column(Text, nullable=True)
    
    workflow_rule_id = Column(UUID(as_uuid=True), ForeignKey("workflow_rules.id"), nullable=True)
    
    # Analytics
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Deduplication
    idempotency_key = Column(String, unique=True, nullable=True)

class UserMessagingPreference(Base, TimestampMixin):
    __tablename__ = "user_messaging_preferences"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), primary_key=True)
    
    whatsapp_enabled = Column(Boolean, default=True)
    sms_fallback_enabled = Column(Boolean, default=True)
    language_preference = Column(String, default="en") # en, ml (Malayalam)
    
    opt_in_at = Column(DateTime(timezone=True))
    opt_out_at = Column(DateTime(timezone=True), nullable=True)
    
    # Category-specific preferences
    vaccination_reminders = Column(Boolean, default=True)
    financial_alerts = Column(Boolean, default=True)
    emergency_alerts = Column(Boolean, default=True)
