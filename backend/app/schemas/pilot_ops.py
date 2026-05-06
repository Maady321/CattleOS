from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class PilotSuccessScoreResponse(BaseModel):
    total_score: int
    activation: int
    usage: int
    status: str

class CohortBenchmarkResponse(BaseModel):
    avg_score: float
    total_farms: int
    top_performer_id: Optional[UUID]

class FieldOpsDashboardResponse(BaseModel):
    active_deployments: int
    at_risk_farms: List[Dict[str, Any]]
    pending_visits: int
    avg_ttv_days: float # Time to Value
