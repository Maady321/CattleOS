from typing import Optional, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class AnomalyBase(BaseModel):
    farm_id: UUID
    resource_type: str
    resource_id: UUID
    anomaly_type: str
    severity: str
    description: str

class AnomalyResponse(AnomalyBase):
    id: UUID
    is_resolved: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class IntegrityCheckResponse(BaseModel):
    id: UUID
    check_type: str
    status: str
    results_json: Dict[str, Any]
    created_at: datetime
    
    class Config:
        from_attributes = True

class CorrectionCreate(BaseModel):
    farm_id: UUID
    resource_type: str
    resource_id: UUID
    original_data: Dict[str, Any]
    corrected_data: Dict[str, Any]
    reason: str
    anomaly_id: Optional[UUID] = None

class CorrectionResponse(CorrectionCreate):
    id: UUID
    status: str
    user_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    open_anomalies: int
    last_check_status: str
    last_check_at: Optional[datetime]
    health_score: float
