import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base, TimestampMixin

class SubsidyStatus(str, enum.Enum):
    ELIGIBLE = "ELIGIBLE"
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    DISBURSED = "DISBURSED"
    REJECTED = "REJECTED"

class SubsidyScheme(Base, TimestampMixin):
    __tablename__ = "subsidy_schemes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True) # e.g. DEDS (Dairy Entrepreneurship Development Scheme)
    department = Column(String) # e.g. Dept of Animal Husbandry
    
    description = Column(Text)
    eligibility_criteria = Column(JSON) # e.g. {"min_cattle": 2, "max_cattle": 10, "is_sc_st": false}
    required_documents = Column(JSON) # e.g. ["aadhaar", "bank_passbook", "land_records"]
    
    is_active = Column(Boolean, default=True)

class SubsidyApplication(Base, TimestampMixin):
    __tablename__ = "subsidy_applications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    scheme_id = Column(UUID(as_uuid=True), ForeignKey("subsidy_schemes.id"))
    
    status = Column(SQLEnum(SubsidyStatus), default=SubsidyStatus.DRAFT, index=True)
    
    # Form Data
    applicant_details = Column(JSON)
    submitted_documents = Column(JSON) # URLs to uploaded docs
    
    submission_date = Column(DateTime(timezone=True), nullable=True)
    reference_number = Column(String, unique=True, index=True) # Govt tracking ID
    
    notes = Column(Text)
    
    scheme = relationship("SubsidyScheme")

class ComplianceRecord(Base, TimestampMixin):
    __tablename__ = "compliance_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    
    compliance_type = Column(String) # e.g. VACCINATION_COMPLIANCE, SANITATION_AUDIT
    status = Column(String) # COMPLIANT, NON_COMPLIANT
    last_audit_date = Column(DateTime(timezone=True))
    expiry_date = Column(DateTime(timezone=True))
