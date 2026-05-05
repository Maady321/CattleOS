import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Float, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class HealthLog(Base):
    __tablename__ = "health_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id"), nullable=False)
    description = Column(Text, nullable=False)
    diagnosis = Column(String, nullable=True)
    temperature = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    cattle = relationship("Cattle", back_populates="health_logs")

class Vaccination(Base):
    __tablename__ = "vaccinations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id"), nullable=False)
    vaccine_name = Column(String, nullable=False)
    date_administered = Column(DateTime(timezone=True), server_default=func.now())
    next_due_date = Column(DateTime(timezone=True), nullable=True)
    cattle = relationship("Cattle", back_populates="vaccinations")

class Medicine(Base):
    __tablename__ = "medicines"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id"), nullable=False)
    medicine_name = Column(String, nullable=False)
    dosage = Column(String, nullable=False)
    frequency = Column(String, nullable=False)
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    cattle = relationship("Cattle", back_populates="medicines")

class MilkLog(Base):
    __tablename__ = "milk_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id"), nullable=False)
    quantity_liters = Column(Float, nullable=False)
    session = Column(String, nullable=False) # e.g., Morning, Evening
    fat_content = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    cattle = relationship("Cattle", back_populates="milk_logs")

class FeedLog(Base):
    __tablename__ = "feed_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id"), nullable=False)
    feed_type = Column(String, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    cost = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    cattle = relationship("Cattle", back_populates="feed_logs")

class BreedingLog(Base):
    __tablename__ = "breeding_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id"), nullable=False)
    event_type = Column(String, nullable=False) # Insemination, Heat, Pregnancy Check, Calving
    date = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text, nullable=True)
    success = Column(Boolean, nullable=True)
    cattle = relationship("Cattle", back_populates="breeding_logs", foreign_keys=[cattle_id])

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    alert_type = Column(String, nullable=False) # health, reminder, breeding, system
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Document(Base):
    __tablename__ = "documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id"), nullable=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
