import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Float, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base, TimestampMixin

class PolicyStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    PENDING_RENEWAL = "PENDING_RENEWAL"
    CANCELLED = "CANCELLED"

class ClaimStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_INVESTIGATION = "UNDER_INVESTIGATION"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PAID = "PAID"

class InsurancePolicy(Base, TimestampMixin):
    __tablename__ = "insurance_policies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id"), unique=True)
    
    policy_number = Column(String, unique=True, index=True)
    insurer_name = Column(String) # e.g. LIC, United India Insurance
    
    premium_amount = Column(Float)
    sum_assured = Column(Float)
    
    start_date = Column(DateTime(timezone=True))
    expiry_date = Column(DateTime(timezone=True), index=True)
    
    status = Column(SQLEnum(PolicyStatus), default=PolicyStatus.ACTIVE)
    policy_document_url = Column(String, nullable=True)

class InsuranceClaim(Base, TimestampMixin):
    __tablename__ = "insurance_claims"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    policy_id = Column(UUID(as_uuid=True), ForeignKey("insurance_policies.id"), index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"))
    
    claim_type = Column(String) # DEATH, ACCIDENT, DISABILITY
    status = Column(SQLEnum(ClaimStatus), default=ClaimStatus.SUBMITTED)
    
    incident_date = Column(DateTime(timezone=True))
    incident_description = Column(Text)
    
    claimed_amount = Column(Float)
    approved_amount = Column(Float, nullable=True)
    
    # Evidence
    documents_json = Column(JSON) # URLs for Vet Report, Ear Tag Photo, etc.
    
    # Fraud Detection Flags
    is_suspicious = Column(Boolean, default=False)
    fraud_flags = Column(JSON, default=[])

    policy = relationship("InsurancePolicy")
