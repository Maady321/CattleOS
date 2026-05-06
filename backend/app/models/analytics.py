import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Float, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base, TimestampMixin

class AnalyticsEvent(Base, TimestampMixin):
    __tablename__ = "analytics_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    
    event_name = Column(String, index=True) # e.g. 'MILK_LOG_CREATED', 'VOICE_COMMAND_USED'
    category = Column(String, index=True) # ACTIVATION, RETENTION, FEATURE_USAGE, REVENUE
    
    properties = Column(JSON, default={}) # e.g. {"liters": 5.2, "language": "ml"}
    
    source = Column(String) # WEB, MOBILE, SERVER
    session_id = Column(String, index=True)

class FarmMetric(Base, TimestampMixin):
    """
    Pre-aggregated metrics for fast dashboard rendering.
    """
    __tablename__ = "farm_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), unique=True, index=True)
    
    activation_score = Column(Integer, default=0)
    churn_risk_score = Column(Integer, default=0)
    
    total_milk_recorded = Column(Float, default=0.0)
    last_activity_at = Column(DateTime(timezone=True))
    
    engagement_flags = Column(JSON, default={}) # e.g. {"has_cattle": true, "has_voice": false}

class UserCohort(Base, TimestampMixin):
    __tablename__ = "analytics_cohorts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String) # e.g. "2026-W18-PILOT"
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
