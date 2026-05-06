import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base, TimestampMixin

class AdminActionType(str, enum.Enum):
    IMPERSONATION_START = "IMPERSONATION_START"
    ACCOUNT_SUSPEND = "ACCOUNT_SUSPEND"
    ACCOUNT_RECOVER = "ACCOUNT_RECOVER"
    FEATURE_FLAG_TOGGLE = "FEATURE_FLAG_TOGGLE"
    BILLING_ADJUST = "BILLING_ADJUST"
    WORKFLOW_REPLAY = "WORKFLOW_REPLAY"
    TOKEN_REVOKE = "TOKEN_REVOKE"

class AdminActionLog(Base, TimestampMixin):
    __tablename__ = "admin_action_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    operator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    target_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    target_farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=True)
    
    action_type = Column(SQLEnum(AdminActionType), nullable=False)
    description = Column(Text)
    
    # Context data (request IP, previous state, etc)
    context = Column(JSON, default={})
    
    operator = relationship("User", foreign_keys=[operator_id])

class FeatureFlag(Base, TimestampMixin):
    __tablename__ = "feature_flags"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True)
    is_enabled = Column(Boolean, default=False)
    
    # Can be scoped to specific farms
    farm_overrides = Column(JSON, default={}) # e.g. {"farm_uuid": true}

class OperatorNote(Base, TimestampMixin):
    __tablename__ = "operator_notes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    operator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    note_type = Column(String) # SUPPORT, BILLING, INCIDENT
    content = Column(Text, nullable=False)
    
    # Internal tags
    tags = Column(JSON, default=[])
