from typing import Any
from sqlalchemy import Column, DateTime, Boolean, func, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import as_declarative, declared_attr

@as_declarative()
class Base:
    id: Any
    __name__: str
    
    # Generate __tablename__ automatically
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower() + "s" # pluralize by default

class TimestampMixin:
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class SoftDeleteMixin:
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)
    is_deleted = Column(Boolean, default=False, index=True)

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = func.now()

class SyncMixin:
    version = Column(BigInteger, server_default="1", nullable=False, index=True)
    client_mutation_id = Column(UUID(as_uuid=True), nullable=True, index=True)

class ImmutableMixin:
    """
    Mixin for tables that should be append-only.
    Updates and deletes (even soft deletes) should be restricted or audited heavily.
    """
    is_immutable = True
