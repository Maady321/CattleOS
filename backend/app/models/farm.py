import uuid
from sqlalchemy import Column, String, ForeignKey, Enum as SQLEnum, Boolean, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base, TimestampMixin, SoftDeleteMixin
from app.models.user import UserRole

class Farm(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "farms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, index=True)
    location = Column(String, nullable=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    
    # ACTIVE, SUSPENDED, DELETED
    status = Column(String, default="ACTIVE", index=True) 
    current_version = Column(BigInteger, server_default="1", nullable=False)
    
    owner = relationship("User", foreign_keys=[owner_id])
    cattle = relationship("Cattle", back_populates="farm", cascade="all, delete-orphan")
    memberships = relationship("FarmMembership", back_populates="farm", cascade="all, delete-orphan")

class FarmMembership(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "farm_memberships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Use canonical UserRole enum
    role = Column(SQLEnum(UserRole), nullable=False, index=True) 
    
    # ACTIVE, PENDING, REVOKED
    status = Column(String, default="ACTIVE", index=True) 
    
    invited_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    user = relationship("User", foreign_keys=[user_id], backref="farm_memberships")
    farm = relationship("Farm", back_populates="memberships")
    inviter = relationship("User", foreign_keys=[invited_by])
