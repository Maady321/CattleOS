import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base, TimestampMixin

class BackupVerification(Base, TimestampMixin):
    __tablename__ = "backup_verifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resource_type = Column(String, index=True) # POSTGRES, REDIS, S3
    
    status = Column(String, index=True) # SUCCESS, FAILED, RUNNING
    checksum_valid = Column(Boolean, default=False)
    
    # Benchmarking
    restore_start_at = Column(DateTime(timezone=True))
    restore_end_at = Column(DateTime(timezone=True))
    total_time_seconds = Column(Float)
    
    # Data stats
    record_count_verified = Column(Integer)
    data_size_bytes = Column(Integer)
    
    logs = Column(Text)
    error_message = Column(Text, nullable=True)
    
    sandbox_id = Column(String) # ID of the sandbox container/DB used
    
class DRPolicy(Base, TimestampMixin):
    __tablename__ = "dr_policies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True)
    description = Column(Text)
    
    # Requirements
    target_rto_seconds = Column(Integer) # Recovery Time Objective
    target_rpo_seconds = Column(Integer) # Recovery Point Objective
    
    verification_frequency_hours = Column(Integer, default=24)
    is_active = Column(Boolean, default=True)

class DRAuditLog(Base, TimestampMixin):
    __tablename__ = "dr_audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String, index=True) # DRILL_STARTED, DRILL_COMPLETED, CONFIG_CHANGE
    details = Column(JSON)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
