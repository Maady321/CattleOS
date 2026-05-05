import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.user import UserRole

class Farm(Base):
    __tablename__ = "farms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(String, default="ACTIVE") # ACTIVE, SUSPENDED, DELETED
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    owner = relationship("User", foreign_keys=[owner_id])
    cattle = relationship("Cattle", back_populates="farm", cascade="all, delete-orphan")
    memberships = relationship("FarmMembership", back_populates="farm", cascade="all, delete-orphan")

class FarmMembership(Base):
    __tablename__ = "farm_memberships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    role = Column(String, nullable=False) # Roles: farm_owner, manager, worker, vet, viewer
    status = Column(String, default="ACTIVE") # ACTIVE, PENDING, REVOKED
    invited_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id], backref="farm_memberships")
    farm = relationship("Farm", back_populates="memberships")
    inviter = relationship("User", foreign_keys=[invited_by])
