import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Float, Text, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from app.db.base_class import Base, TimestampMixin, SoftDeleteMixin, SyncMixin, ImmutableMixin

class HealthLog(Base, TimestampMixin, SoftDeleteMixin, SyncMixin):
    __tablename__ = "health_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    
    description = Column(Text, nullable=False)
    diagnosis = Column(String, nullable=True, index=True)
    temperature = Column(Float, nullable=True)
    
    cattle = relationship("Cattle", back_populates="health_logs")
    farm = relationship("Farm")

class Vaccination(Base, TimestampMixin, SoftDeleteMixin, SyncMixin):
    __tablename__ = "vaccinations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    
    vaccine_name = Column(String, nullable=False, index=True)
    date_administered = Column(DateTime(timezone=True), nullable=False, index=True)
    next_due_date = Column(DateTime(timezone=True), nullable=True, index=True)
    
    cattle = relationship("Cattle", back_populates="vaccinations")

class Medicine(Base, TimestampMixin, SoftDeleteMixin, SyncMixin):
    __tablename__ = "medicines"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    
    medicine_name = Column(String, nullable=False, index=True)
    dosage = Column(String, nullable=False)
    frequency = Column(String, nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False, index=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    
    cattle = relationship("Cattle", back_populates="medicines")

class MilkLog(Base, TimestampMixin, SoftDeleteMixin, SyncMixin, ImmutableMixin):
    __tablename__ = "milk_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    
    quantity_liters = Column(Float, nullable=False, index=True)
    session = Column(String, nullable=False, index=True) # Morning, Evening
    fat_content = Column(Float, nullable=True)
    snf_content = Column(Float, nullable=True)
    protein_content = Column(Float, nullable=True)
    
    cattle = relationship("Cattle", back_populates="milk_logs")

class FeedLog(Base, TimestampMixin, SoftDeleteMixin, SyncMixin, ImmutableMixin):
    __tablename__ = "feed_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    
    feed_type = Column(String, nullable=False, index=True)
    quantity_kg = Column(Float, nullable=False)
    cost = Column(Float, nullable=True)
    
    cattle = relationship("Cattle", back_populates="feed_logs")

class BreedingLog(Base, TimestampMixin, SoftDeleteMixin, SyncMixin, ImmutableMixin):
    __tablename__ = "breeding_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    
    event_type = Column(String, nullable=False, index=True) # Insemination, Heat, Pregnancy Check, Calving
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    notes = Column(Text, nullable=True)
    success = Column(Boolean, nullable=True, index=True)
    
    cattle = relationship("Cattle", back_populates="breeding_logs", foreign_keys=[cattle_id])

class Alert(Base, TimestampMixin, SoftDeleteMixin, SyncMixin):
    __tablename__ = "alerts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    alert_type = Column(String, nullable=False, index=True)
    is_read = Column(Boolean, default=False, index=True)

class Notification(Base, TimestampMixin, SoftDeleteMixin, SyncMixin):
    __tablename__ = "notifications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, index=True)
    link = Column(String, nullable=True)

class Export(Base, TimestampMixin, SoftDeleteMixin, SyncMixin):
    __tablename__ = "exports"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    
    resource_type = Column(String, nullable=False, index=True)
    format = Column(String, nullable=False) # PDF, CSV
    status = Column(String, default="PENDING", index=True) # PENDING, COMPLETED, FAILED
    file_path = Column(String, nullable=True)

class AnalyticsReport(Base, TimestampMixin, SoftDeleteMixin, SyncMixin):
    __tablename__ = "analytics_reports"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    
    report_type = Column(String, nullable=False, index=True)
    data = Column(Text, nullable=True) # Stored as JSON string or large text
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)

class Document(Base, TimestampMixin, SoftDeleteMixin, SyncMixin):
    __tablename__ = "documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cattle_id = Column(UUID(as_uuid=True), ForeignKey("cattle.id", ondelete="SET NULL"), nullable=True, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    
    file_name = Column(String, nullable=False, index=True)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False, index=True)

class FinancialRecord(Base, TimestampMixin, SoftDeleteMixin, SyncMixin, ImmutableMixin):
    __tablename__ = "financial_records"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    
    transaction_type = Column(String, nullable=False, index=True) # INCOME, EXPENSE
    category = Column(String, nullable=False, index=True) # FEED, MEDICINE, MILK_SALE, CATTLE_SALE, LABOR, OTHER
    amount = Column(Float, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    resource_type = Column(String, nullable=True, index=True) # Optional link to cattle, milk_log etc
    resource_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    
    is_reconciled = Column(Boolean, default=False, index=True)

class WorkflowEvent(Base, TimestampMixin, SoftDeleteMixin, SyncMixin, ImmutableMixin):
    __tablename__ = "workflow_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    event_name = Column(String, nullable=False, index=True) # e.g. MIGRATION_COMPLETE, BATCH_UPDATE
    metadata_json = Column(JSON, default={})
    status = Column(String, default="COMPLETED", index=True)
