import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Text, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base, TimestampMixin

class FarmOnboarding(Base, TimestampMixin):
    __tablename__ = "farm_onboarding"
    
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), primary_key=True)
    step_completed = Column(Integer, default=0) # 0 to 5 steps
    is_wizard_completed = Column(Boolean, default=False)
    
    checklist_json = Column(JSON, default={
        "profile_setup": False,
        "cattle_imported": False,
        "first_milk_log": False,
        "first_health_log": False,
        "subscription_active": False
    })
    
    onboarding_score = Column(Float, default=0.0)
    assigned_success_manager_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

class SupportTicket(Base, TimestampMixin):
    __tablename__ = "support_tickets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, index=True) # BUG, FEATURE_REQUEST, SETUP_HELP, BILLING
    priority = Column(String, default="MEDIUM", index=True) # LOW, MEDIUM, HIGH, URGENT
    status = Column(String, default="OPEN", index=True) # OPEN, IN_PROGRESS, RESOLVED, CLOSED
    
    metadata_json = Column(JSON, default={}) # Device info, version etc.
    
    sla_deadline = Column(DateTime(timezone=True))
    resolved_at = Column(DateTime(timezone=True), nullable=True)

class CustomerFeedback(Base, TimestampMixin):
    __tablename__ = "customer_feedback"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    rating = Column(Integer) # 1-5
    comment = Column(Text)
    feature_tag = Column(String, nullable=True) # Feedback for specific feature
    
class UsageMetric(Base, TimestampMixin):
    __tablename__ = "usage_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False, index=True)
    
    metric_name = Column(String, index=True) # DAILY_ACTIVE_USERS, LOGS_CREATED, EXPORTS_RUN
    metric_value = Column(Float)
    date = Column(DateTime(timezone=True), index=True)
