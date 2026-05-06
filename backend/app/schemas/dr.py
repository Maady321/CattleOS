from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class DRVerificationResponse(BaseModel):
    id: UUID
    resource_type: str
    status: str
    checksum_valid: bool
    total_time_seconds: float
    record_count_verified: Optional[int]
    created_at: datetime
    error_message: Optional[str]
    
    class Config:
        from_attributes = True

class DRDashboardData(BaseModel):
    recent_verifications: List[DRVerificationResponse]
    avg_rto_seconds: Dict[str, float]
    compliance_status: str
    last_drill_at: Optional[datetime]

class DRPolicyResponse(BaseModel):
    name: str
    target_rto_seconds: int
    target_rpo_seconds: int
    verification_frequency_hours: int
    
    class Config:
        from_attributes = True
