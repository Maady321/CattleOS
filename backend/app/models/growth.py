import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Float, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base, TimestampMixin

class PMFResponse(str, enum.Enum):
    VERY_DISAPPOINTED = "VERY_DISAPPOINTED"
    SOMEWHAT_DISAPPOINTED = "SOMEWHAT_DISAPPOINTED"
    NOT_DISAPPOINTED = "NOT_DISAPPOINTED"
    NOT_APPLICABLE = "NOT_APPLICABLE"

class PMFSurvey(Base, TimestampMixin):
    __tablename__ = "growth_pmf_surveys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    
    response = Column(SQLEnum(PMFResponse), nullable=False)
    feedback_text = Column(Text)
    
    # Testimonial opt-in
    can_use_as_testimonial = Column(Boolean, default=False)

class Referral(Base, TimestampMixin):
    __tablename__ = "growth_referrals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    referrer_farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    referred_email = Column(String, index=True)
    
    referral_code = Column(String, unique=True, index=True)
    status = Column(String, default="PENDING") # PENDING, SIGNED_UP, CONVERTED
    
    reward_granted = Column(Boolean, default=False)

class FeatureRequest(Base, TimestampMixin):
    __tablename__ = "growth_feature_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"))
    
    title = Column(String)
    description = Column(Text)
    
    votes = Column(Integer, default=1)
    status = Column(String, default="UNDER_REVIEW") # PLANNED, SHIPPED
