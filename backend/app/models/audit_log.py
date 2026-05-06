import uuid
import hashlib
from sqlalchemy import Column, String, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base, TimestampMixin, SoftDeleteMixin

class AuditLog(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String, index=True, nullable=False) # e.g., "AUTH_LOGIN", "DATA_CREATE"
    action = Column(String, index=True) # e.g., "CREATE", "UPDATE", "DELETE", "EXPORT"
    
    # Context
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="SET NULL"), nullable=True, index=True)
    ip_address = Column(String, index=True)
    user_agent = Column(String)
    
    # Resource info
    resource_type = Column(String, index=True) # e.g., "CATTLE", "FARM", "USER"
    resource_id = Column(String, index=True)
    
    # Data
    metadata_json = Column(JSON, default={})
    status = Column(String, default="SUCCESS", index=True) # SUCCESS, FAILURE, SUSPICIOUS
    
    # Integrity (Tamper Resistance)
    previous_hash = Column(String, nullable=True)
    log_hash = Column(String, nullable=False)
    
    def calculate_hash(self, prev_hash: str = "") -> str:
        """
        Calculates a hash for the current log entry, chained to the previous one.
        """
        payload = f"{self.event_type}|{self.user_id}|{self.resource_id}|{self.status}|{prev_hash}"
        return hashlib.sha256(payload.encode()).hexdigest()
