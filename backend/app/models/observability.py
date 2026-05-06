import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Text, Float, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base, TimestampMixin

class AlertSeverity(str, enum.Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"
    EMERGENCY = "EMERGENCY"

class AlertStatus(str, enum.Enum):
    FIRING = "FIRING"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"
    SILENCED = "SILENCED"

class AlertRule(Base, TimestampMixin):
    __tablename__ = "alert_rules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)
    
    # Logic
    metric_name = Column(String, nullable=False) # e.g. "api_latency_p95", "auth_failure_count"
    operator = Column(String) # ">", "<", "==", ">="
    threshold = Column(Float)
    duration_minutes = Column(Integer, default=5) # Alert if condition stays for X min
    
    severity = Column(SQLEnum(AlertSeverity), default=AlertSeverity.WARNING)
    is_enabled = Column(Boolean, default=True)
    
    # Metadata
    runbook_url = Column(String)
    dashboard_url = Column(String)
    labels = Column(JSON, default={}) # e.g. {"service": "api", "env": "prod"}

class AlertIncident(Base, TimestampMixin):
    __tablename__ = "alert_incidents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rule_id = Column(UUID(as_uuid=True), ForeignKey("alert_rules.id"))
    
    status = Column(SQLEnum(AlertStatus), default=AlertStatus.FIRING, index=True)
    summary = Column(Text)
    details = Column(JSON)
    
    starts_at = Column(DateTime(timezone=True), nullable=False)
    ends_at = Column(DateTime(timezone=True), nullable=True)
    last_seen_at = Column(DateTime(timezone=True))
    
    acknowledged_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Deduplication key
    fingerprint = Column(String, unique=True, index=True)
    
    rule = relationship("AlertRule")

class AlertRouting(Base, TimestampMixin):
    __tablename__ = "alert_routings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    severity = Column(SQLEnum(AlertSeverity))
    channel = Column(String) # SLACK, EMAIL, PAGERDUTY
    destination = Column(String) # Webhook URL, email address, service key
    
    escalation_delay_minutes = Column(Integer, default=30)
    escalation_channel = Column(String, nullable=True)
