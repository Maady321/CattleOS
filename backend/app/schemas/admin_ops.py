from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class AdminUserLookup(BaseModel):
    id: UUID
    email: str
    full_name: str
    farm_name: Optional[str]
    is_active: bool
    last_login: Optional[datetime]

class AdminAuditLogResponse(BaseModel):
    id: UUID
    operator_email: str
    action_type: str
    description: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class FailedJobResponse(BaseModel):
    id: str
    name: str
    error: str
    time: str

class AdminDashboardStats(BaseModel):
    total_active_users: int
    total_active_farms: int
    failed_jobs_count: int
    active_incidents: int
