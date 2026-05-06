import uuid
from sqlalchemy import Column, String, ForeignKey, BigInteger, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base

class SyncLog(Base):
    __tablename__ = "sync_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    
    entity_type = Column(String, nullable=False, index=True) # 'cattle', 'milk_log', etc.
    entity_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    version = Column(BigInteger, nullable=False, index=True)
    operation = Column(String, nullable=False) # 'INSERT', 'UPDATE', 'DELETE'
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
