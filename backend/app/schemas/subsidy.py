from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class SubsidySchemeResponse(BaseModel):
    id: UUID
    name: str
    department: str
    description: Optional[str]
    required_documents: List[str]
    eligibility_criteria: Dict[str, Any]
    
    class Config:
        from_attributes = True

class EligibilityResponse(BaseModel):
    eligible: bool
    reasons: List[str]
    current_cattle_count: int

class SubsidyApplicationResponse(BaseModel):
    id: UUID
    status: str
    submission_date: Optional[datetime]
    reference_number: Optional[str]
    scheme: SubsidySchemeResponse
    
    class Config:
        from_attributes = True

class ComplianceStatus(BaseModel):
    is_compliant: bool
    missing_requirements: List[str]
    last_audit: Optional[datetime]
