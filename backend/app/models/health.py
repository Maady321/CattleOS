import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Float, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base, TimestampMixin

class ConsultationStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    EMERGENCY = "EMERGENCY"

class Vet(Base, TimestampMixin):
    __tablename__ = "vets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    
    license_number = Column(String, unique=True)
    specializations = Column(JSON, default=[]) # ['Surgery', 'Breeding']
    is_verified = Column(Boolean, default=False)
    
    rating = Column(Float, default=5.0)
    geo_location = Column(JSON) # {'lat': ..., 'lng': ...}
    
    availability_status = Column(String, default="AVAILABLE")

class Consultation(Base, TimestampMixin):
    __tablename__ = "consultations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    vet_id = Column(UUID(as_uuid=True), ForeignKey("vets.id"), index=True)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id"))
    
    status = Column(SQLEnum(ConsultationStatus), default=ConsultationStatus.REQUESTED)
    symptoms = Column(Text)
    diagnosis = Column(Text)
    
    meeting_link = Column(String) # Tele-consult link
    is_emergency = Column(Boolean, default=False)

class Prescription(Base, TimestampMixin):
    __tablename__ = "prescriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id = Column(UUID(as_uuid=True), ForeignKey("consultations.id"), index=True)
    
    medicines = Column(JSON) # [{'name': ..., 'dosage': ..., 'duration': ...}]
    instructions = Column(Text)
    valid_until = Column(DateTime(timezone=True))

class ClinicalVaccinationRecord(Base, TimestampMixin):
    __tablename__ = "clinical_vaccinations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id"), index=True)
    
    vaccine_name = Column(String)
    administered_at = Column(DateTime(timezone=True))
    next_dose_at = Column(DateTime(timezone=True))
    
    administered_by = Column(UUID(as_uuid=True), ForeignKey("vets.id"))
