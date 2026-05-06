from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class ScorecardResponse(BaseModel):
    id: UUID
    health_score: int
    utilization_rate: float
    benchmark_rank: int
    nps_score: Optional[int]
    
    class Config:
        from_attributes = True

class MilestoneResponse(BaseModel):
    milestone_name: str
    completed_at: datetime
    is_critical: bool

class CSIncidentCreate(BaseModel):
    category: str # TRAINING, BUG
    severity: str # LOW, MEDIUM, HIGH
    summary: str

class CSDashboardResponse(BaseModel):
    active_farms: int
    onboarding_count: int
    avg_health_score: float
    churn_watchlist: List[Dict[str, Any]]
    open_incidents_count: int
