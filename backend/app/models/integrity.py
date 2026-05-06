import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Float, Integer, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base, TimestampMixin

class CalculationFormula(Base, TimestampMixin):
    __tablename__ = "calculation_formulas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, index=True, nullable=False) # e.g., "DAILY_MILK_YIELD"
    version = Column(Integer, default=1, nullable=False)
    formula_json = Column(JSON, nullable=False) # The logic definition
    is_active = Column(Boolean, default=True)
    
    __mapper_args__ = {
        "confirm_deleted_rows": False
    }

class IntegrityCheck(Base, TimestampMixin):
    __tablename__ = "integrity_checks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    check_type = Column(String, index=True) # RECONCILIATION, ANOMALY, MISSING_DATA
    status = Column(String, index=True) # PASSED, FAILED, WARNING
    results_json = Column(JSON, default={})
    
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))

class DataAnomaly(Base, TimestampMixin):
    __tablename__ = "data_anomalies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    
    resource_type = Column(String, index=True)
    resource_id = Column(UUID(as_uuid=True), index=True)
    
    anomaly_type = Column(String, index=True) # OUTLIER, DUPLICATE, INCONSISTENCY
    severity = Column(String, index=True) # LOW, MEDIUM, HIGH, CRITICAL
    
    description = Column(Text)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

class DataCorrection(Base, TimestampMixin):
    __tablename__ = "data_corrections"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    anomaly_id = Column(UUID(as_uuid=True), ForeignKey("data_anomalies.id"), nullable=True)
    
    resource_type = Column(String, index=True)
    resource_id = Column(UUID(as_uuid=True), index=True)
    
    original_data = Column(JSON)
    corrected_data = Column(JSON)
    reason = Column(Text)
    
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED
