import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Float, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base, TimestampMixin

class VerificationType(str, enum.Enum):
    FARM = "FARM"
    VET = "VET"
    COOPERATIVE = "COOPERATIVE"
    PARTNER = "PARTNER"

class VerificationRequest(Base, TimestampMixin):
    __tablename__ = "trust_verification_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    target_id = Column(UUID(as_uuid=True), index=True) # User/Farm/Partner ID
    entity_type = Column(SQLEnum(VerificationType), nullable=False)
    
    document_urls = Column(JSON, default=[]) # KYC docs
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED
    
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    rejection_reason = Column(Text)

class TransparencyReport(Base, TimestampMixin):
    __tablename__ = "trust_transparency_reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    month = Column(Integer)
    year = Column(Integer)
    
    metrics = Column(JSON) # {'fraud_prevented': ..., 'uptime': ...}
    is_public = Column(Boolean, default=True)

class PlatformHealth(Base, TimestampMixin):
    __tablename__ = "trust_platform_health"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    service_name = Column(String, unique=True)
    status = Column(String, default="OPERATIONAL") # OPERATIONAL, DEGRADED, DOWN
    uptime_percentage = Column(Float, default=100.0)
    last_checked_at = Column(DateTime(timezone=True))
