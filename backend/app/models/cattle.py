import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Date, Float, Enum as SQLAlchemyEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base

class CattleGender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"

class CattleStatus(str, enum.Enum):
    ACTIVE = "active"
    SOLD = "sold"
    DECEASED = "deceased"

class Cattle(Base):
    __tablename__ = "cattle"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tag_id = Column(String, unique=True, index=True, nullable=False) # Digital Passport
    name = Column(String, nullable=True)
    breed = Column(String, nullable=False)
    gender = Column(SQLAlchemyEnum(CattleGender), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    weight = Column(Float, nullable=True)
    status = Column(SQLAlchemyEnum(CattleStatus), default=CattleStatus.ACTIVE)
    
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    parent_mother_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id"), nullable=True)
    parent_father_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    farm = relationship("Farm", back_populates="cattle")
    health_logs = relationship("HealthLog", back_populates="cattle", cascade="all, delete-orphan")
    milk_logs = relationship("MilkLog", back_populates="cattle", cascade="all, delete-orphan")
    feed_logs = relationship("FeedLog", back_populates="cattle", cascade="all, delete-orphan")
    breeding_logs = relationship("BreedingLog", back_populates="cattle", cascade="all, delete-orphan", foreign_keys="[BreedingLog.cattle_id]")
    vaccinations = relationship("Vaccination", back_populates="cattle", cascade="all, delete-orphan")
    medicines = relationship("Medicine", back_populates="cattle", cascade="all, delete-orphan")
    qr_code_url = Column(String, nullable=True)
