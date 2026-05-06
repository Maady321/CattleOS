import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base, TimestampMixin, SoftDeleteMixin

class UserSession(Base, TimestampMixin):
    """
    Represents an active session associated with a specific device/browser.
    """
    __tablename__ = "user_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_token = Column(String, unique=True, index=True, nullable=False) # Bound to signed cookie
    
    device_fingerprint = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    
    is_active = Column(Boolean, default=True, index=True)
    last_active = Column(DateTime(timezone=True), server_default="now()", onupdate="now()")
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)

    user = relationship("User", backref="sessions")

class RefreshToken(Base, TimestampMixin):
    """
    Persistent registry for refresh tokens to support rotation and revocation.
    """
    __tablename__ = "refresh_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    jti = Column(String, unique=True, index=True, nullable=False) # JWT ID
    family_id = Column(UUID(as_uuid=True), nullable=False, index=True) # For rotation detection
    
    issued_at = Column(DateTime(timezone=True), server_default="now()")
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    replaced_by = Column(String, nullable=True) # JTI of the token that replaced this one
    
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    device_fingerprint = Column(String, nullable=True)
    
    is_compromised = Column(Boolean, default=False, index=True)

    user = relationship("User", backref="refresh_tokens")
