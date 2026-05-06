import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Float, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base, TimestampMixin

class SyncStatus(str, enum.Enum):
    PENDING = "PENDING"
    SYNCED = "SYNCED"
    FAILED = "FAILED"
    CONFLICT = "CONFLICT"

class Cooperative(Base, TimestampMixin):
    __tablename__ = "cooperatives"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True) # e.g. Amul, Milma
    api_endpoint = Column(String)
    api_key = Column(String)
    
    is_active = Column(Boolean, default=True)

class CooperativeCollection(Base, TimestampMixin):
    """
    Records of milk collected by the cooperative from the farm.
    Used for reconciliation against local MilkLog.
    """
    __tablename__ = "cooperative_collections"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    cooperative_id = Column(UUID(as_uuid=True), ForeignKey("cooperatives.id"))
    
    external_collection_id = Column(String, index=True) # ID from Coop system
    
    quantity_liters = Column(Float, nullable=False)
    fat_pct = Column(Float)
    snf_pct = Column(Float)
    
    collection_date = Column(DateTime(timezone=True), index=True)
    
    sync_status = Column(SQLEnum(SyncStatus), default=SyncStatus.PENDING)
    reconciliation_id = Column(UUID(as_uuid=True), nullable=True) # Link to local MilkLog

class Settlement(Base, TimestampMixin):
    """
    Financial settlements from the cooperative to the farm.
    """
    __tablename__ = "cooperative_settlements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    cooperative_id = Column(UUID(as_uuid=True), ForeignKey("cooperatives.id"))
    
    period_start = Column(DateTime(timezone=True))
    period_end = Column(DateTime(timezone=True))
    
    total_liters = Column(Float)
    gross_amount = Column(Float)
    deductions = Column(Float, default=0.0)
    net_amount = Column(Float)
    
    payment_status = Column(String, index=True) # PAID, PENDING
    payment_reference = Column(String)
