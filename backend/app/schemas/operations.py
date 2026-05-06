from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class SupportTicketCreate(BaseModel):
    subject: str
    description: str
    category: str # BUG, FEATURE, etc.
    priority: str = "MEDIUM"
    metadata_json: Dict[str, Any] = {}

class SupportTicketResponse(SupportTicketCreate):
    id: UUID
    status: str
    farm_id: UUID
    user_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class FeedbackCreate(BaseModel):
    rating: int
    comment: str
    feature_tag: Optional[str] = None

class OnboardingStatus(BaseModel):
    step_completed: int
    is_wizard_completed: bool
    checklist: Dict[str, bool]
    activation_score: float
    churn_risk: float

class SuccessMetricSummary(BaseModel):
    farm_id: UUID
    farm_name: str
    activation_score: float
    churn_risk: float
    last_active: Optional[datetime]
    open_tickets: int
