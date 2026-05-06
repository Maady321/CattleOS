from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class VerificationSubmission(BaseModel):
    entity_type: str
    document_urls: List[str]

class HealthStatusResponse(BaseModel):
    service: str
    status: str
    uptime: float

class TransparencyReportResponse(BaseModel):
    month: int
    year: int
    metrics: Dict[str, Any]

class TrustScoreResponse(BaseModel):
    farm_id: UUID
    score: int
    badges: List[str]
    verification_status: str
