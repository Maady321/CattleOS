import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Float, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base, TimestampMixin

class SuccessStatus(str, enum.Enum):
    ONBOARDING = "ONBOARDING"
    ACTIVE = "ACTIVE"
    STAGNANT = "STAGNANT"
    CHURN_RISK = "CHURN_RISK"
    CHURNED = "CHURNED"

class SuccessMilestone(Base, TimestampMixin):
    __tablename__ = "success_milestones"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    
    milestone_name = Column(String) # e.g. FIRST_MILK_POUR, TRAINING_COMPLETED
    completed_at = Column(DateTime(timezone=True))
    
    is_critical = Column(Boolean, default=False)

class FarmScorecard(Base, TimestampMixin):
    __tablename__ = "farm_scorecards"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), unique=True, index=True)
    
    health_score = Column(Integer, default=100) # 0-100
    utilization_rate = Column(Float, default=0.0) # Feature usage %
    
    benchmark_rank = Column(Integer) # Rank among 100 farms
    
    nps_score = Column(Integer, nullable=True) # Last surveyed NPS
    last_survey_at = Column(DateTime(timezone=True))

class CSIncident(Base, TimestampMixin):
    """
    Tracking support and escalation for pilot farms.
    """
    __tablename__ = "cs_incidents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    
    category = Column(String) # TRAINING, BUG, BILLING
    severity = Column(String) # LOW, MEDIUM, HIGH, BLOCKER
    
    status = Column(String, default="OPEN") # OPEN, ESCALATED, RESOLVED
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    summary = Column(Text)
    resolution_notes = Column(Text)
