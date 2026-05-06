from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class FunnelStep(BaseModel):
    step: str
    count: int
    conversion_rate: float

class CohortRetention(BaseModel):
    cohort_name: str
    week_0: float # 100%
    week_1: float
    week_2: float
    week_4: float

class FeatureUsage(BaseModel):
    feature_name: str
    active_users: int
    total_events: int
    trend: str # e.g. "UP"

class ChurnRiskFarm(BaseModel):
    farm_id: UUID
    farm_name: str
    risk_score: int # 0-100
    last_activity: datetime

class AnalyticsDashboardResponse(BaseModel):
    activation_funnel: List[FunnelStep]
    feature_usage: List[FeatureUsage]
    churn_risks: List[ChurnRiskFarm]
    retention_stats: List[CohortRetention]
