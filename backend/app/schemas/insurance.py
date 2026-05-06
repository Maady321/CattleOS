from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class InsurancePolicyResponse(BaseModel):
    id: UUID
    policy_number: str
    insurer_name: str
    sum_assured: float
    expiry_date: datetime
    status: str
    
    class Config:
        from_attributes = True

class InsuranceClaimCreate(BaseModel):
    policy_id: UUID
    claim_type: str # DEATH, ACCIDENT
    incident_date: datetime
    incident_description: str
    documents: List[str]

class InsuranceClaimResponse(BaseModel):
    id: UUID
    status: str
    incident_date: datetime
    is_suspicious: bool
    claimed_amount: float
    approved_amount: Optional[float]
    
    class Config:
        from_attributes = True

class InsuranceDashboard(BaseModel):
    active_policies: int
    total_insured_value: float
    pending_claims: int
    expiring_soon: List[InsurancePolicyResponse]
