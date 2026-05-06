from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class VetOnboarding(BaseModel):
    license_number: str
    specializations: List[str]
    lat: float
    lng: float

class ConsultationRequest(BaseModel):
    cattle_id: UUID
    vet_id: UUID
    symptoms: str
    is_emergency: bool = False

class PrescriptionCreate(BaseModel):
    consultation_id: UUID
    medicines: List[Dict[str, Any]]
    instructions: str

class CaseHistoryResponse(BaseModel):
    cattle_id: UUID
    consultations: List[Dict[str, Any]]
    prescriptions: List[Dict[str, Any]]
    vaccinations: List[Dict[str, Any]]
