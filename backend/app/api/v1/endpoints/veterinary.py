from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.veterinary import Consultation, VetProfile, ConsultationStatus
from app.schemas.veterinary import (
    ConsultationCreate, 
    ConsultationResponse, 
    PrescriptionCreate,
    VetDashboardData
)
from app.services.veterinary import VeterinaryService
from uuid import UUID

router = APIRouter()

@router.get("/dashboard", response_model=VetDashboardData)
def get_vet_dashboard(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user) # In prod check for VET role
) -> Any:
    vet = db.query(VetProfile).filter(VetProfile.user_id == current_user.id).first()
    if not vet:
        raise HTTPException(status_code=403, detail="Not a registered veterinarian")
        
    upcoming = db.query(Consultation).filter(
        Consultation.vet_id == vet.id,
        Consultation.status == ConsultationStatus.SCHEDULED
    ).all()
    
    return {
        "upcoming_consultations": upcoming,
        "active_cases": len(upcoming),
        "total_completed": 45, # Mock
        "revenue_pending": 1500.0
    }

@router.post("/book", response_model=ConsultationResponse)
def book_vet_visit(
    consult_in: ConsultationCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    service = VeterinaryService(db)
    return service.book_consultation(
        current_user.farm_id,
        consult_in.vet_id,
        consult_in.cattle_id,
        consult_in.scheduled_at,
        consult_in.type
    )

@router.post("/emergency", response_model=ConsultationResponse)
def trigger_emergency_consult(
    cattle_id: UUID,
    symptoms: str,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    service = VeterinaryService(db)
    return service.trigger_emergency_consult(current_user.farm_id, cattle_id, symptoms)

@router.post("/consultations/{consultation_id}/complete")
def complete_clinical_review(
    consultation_id: UUID,
    clinical_data: PrescriptionCreate,
    diagnosis: str,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    service = VeterinaryService(db)
    return service.complete_consultation(
        consultation_id,
        diagnosis,
        clinical_data.medicines
    )
