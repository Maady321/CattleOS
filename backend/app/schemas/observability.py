from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class AlertRuleResponse(BaseModel):
    id: UUID
    name: str
    description: str
    severity: str
    is_enabled: bool
    runbook_url: Optional[str]
    
    class Config:
        from_attributes = True

class AlertIncidentResponse(BaseModel):
    id: UUID
    status: str
    summary: str
    starts_at: datetime
    last_seen_at: datetime
    rule: AlertRuleResponse
    
    class Config:
        from_attributes = True

class AlertDashboardData(BaseModel):
    firing_count: int
    critical_count: int
    active_incidents: List[AlertIncidentResponse]
    recent_resolutions: List[AlertIncidentResponse]
