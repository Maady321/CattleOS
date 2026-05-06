import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base, TimestampMixin

class ConsultationType(str, enum.Enum):
    PHYSICAL = "PHYSICAL"
    TELECONSULT = "TELECONSULT"
    EMERGENCY = "EMERGENCY"

class ConsultationStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class VetProfile(Base, TimestampMixin):
    __tablename__ = "vet_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    
    license_number = Column(String, unique=True, index=True)
    specialization = Column(String)
    hospital_name = Column(String)
    
    is_verified = Column(Boolean, default=False)
    rating = Column(Integer, default=5)
    
    user = relationship("User")

class Consultation(Base, TimestampMixin):
    __tablename__ = "consultations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id"), nullable=True)
    vet_id = Column(UUID(as_uuid=True), ForeignKey("vet_profiles.id"), index=True)
    
    type = Column(SQLEnum(ConsultationType), default=ConsultationType.PHYSICAL)
    status = Column(SQLEnum(ConsultationStatus), default=ConsultationStatus.SCHEDULED)
    
    scheduled_at = Column(DateTime(timezone=True), index=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    
    # Clinical Notes
    symptoms = Column(Text)
    diagnosis = Column(Text)
    notes = Column(Text)
    
    # Teleconsultation Link
    meeting_url = Column(String, nullable=True)
    
    # Billing
    fee_amount = Column(Integer, default=0) # in paise
    is_paid = Column(Boolean, default=False)

class Prescription(Base, TimestampMixin):
    __tablename__ = "prescriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id = Column(UUID(as_uuid=True), ForeignKey("consultations.id"))
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id"))
    
    medicines_json = Column(JSON, nullable=False) # List of medicines, dosage, duration
    instructions = Column(Text)
    follow_up_date = Column(DateTime(timezone=True), nullable=True)

class TreatmentPlan(Base, TimestampMixin):
    __tablename__ = "treatment_plans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id"))
    consultation_id = Column(UUID(as_uuid=True), ForeignKey("consultations.id"))
    
    name = Column(String)
    steps_json = Column(JSON) # List of actions over time
    is_completed = Column(Boolean, default=False)
