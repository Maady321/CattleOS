import uuid
from sqlalchemy import Column, String, ForeignKey, Date, Float, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base, TimestampMixin, SoftDeleteMixin

class CattleGender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"

class CattleStatus(str, enum.Enum):
    ACTIVE = "active"
    SOLD = "sold"
    DECEASED = "deceased"

class Cattle(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "cattle"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tag_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True, index=True)
    breed = Column(String, nullable=False, index=True)
    gender = Column(SQLEnum(CattleGender), nullable=False, index=True)
    date_of_birth = Column(Date, nullable=False, index=True)
    weight = Column(Float, nullable=True)
    status = Column(SQLEnum(CattleStatus), default=CattleStatus.ACTIVE, index=True)
    
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_mother_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id", ondelete="SET NULL"), nullable=True)
    parent_father_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id", ondelete="SET NULL"), nullable=True)
    
    qr_code_url = Column(String, nullable=True)

    farm = relationship("Farm", back_populates="cattle")
    health_logs = relationship("HealthLog", back_populates="cattle", cascade="all, delete-orphan")
    milk_logs = relationship("MilkLog", back_populates="cattle", cascade="all, delete-orphan")
    feed_logs = relationship("FeedLog", back_populates="cattle", cascade="all, delete-orphan")
    breeding_logs = relationship("BreedingLog", back_populates="cattle", cascade="all, delete-orphan", foreign_keys="[BreedingLog.cattle_id]")
    vaccinations = relationship("Vaccination", back_populates="cattle", cascade="all, delete-orphan")
    medicines = relationship("Medicine", back_populates="cattle", cascade="all, delete-orphan")
