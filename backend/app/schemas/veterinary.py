from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class ConsultationCreate(BaseModel):
    vet_id: UUID
    cattle_id: UUID
    scheduled_at: datetime
    type: str # PHYSICAL, TELECONSULT, EMERGENCY

class PrescriptionCreate(BaseModel):
    medicines: List[Dict[str, Any]]
    instructions: str
    follow_up_date: Optional[datetime] = None

class ConsultationResponse(BaseModel):
    id: UUID
    status: str
    type: str
    scheduled_at: datetime
    meeting_url: Optional[str]
    symptoms: Optional[str]
    diagnosis: Optional[str]
    
    class Config:
        from_attributes = True

class VetDashboardData(BaseModel):
    upcoming_consultations: List[ConsultationResponse]
    active_cases: int
    total_completed: int
    revenue_pending: float
