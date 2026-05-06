from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.health import Vet, Consultation, Prescription, VaccinationRecord
from app.schemas.health_ops import (
    VetOnboarding, 
    ConsultationRequest, 
    PrescriptionCreate, 
    CaseHistoryResponse
)
from app.services.veterinary import VeterinaryService
from uuid import UUID

router = APIRouter()

@router.post("/onboard", response_model=Dict[str, Any])
def onboard_veterinarian(
    vet_in: VetOnboarding,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """
    Initial onboarding and KYC for veterinarians.
    """
    vet = Vet(
        user_id=current_user.id,
        license_number=vet_in.license_number,
        specializations=vet_in.specializations,
        geo_location={"lat": vet_in.lat, "lng": vet_in.lng},
        is_verified=False # Pending manual KYC check
    )
    db.add(vet)
    db.commit()
    return {"status": "verification_pending", "vet_id": str(vet.id)}

@router.post("/consultations", response_model=Dict[str, Any])
def book_consultation(
    req: ConsultationRequest,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    service = VeterinaryService(db)
    consult = service.book_consultation(
        farm_id=current_user.farm_id,
        cattle_id=req.cattle_id,
        vet_id=req.vet_id,
        symptoms=req.symptoms,
        is_emergency=req.is_emergency
    )
    return {"consultation_id": str(consult.id), "status": consult.status}

@router.get("/cattle/{cattle_id}/history", response_model=CaseHistoryResponse)
def get_cattle_case_history(
    cattle_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    consultations = db.query(Consultation).filter(Consultation.cattle_id == cattle_id).all()
    vaccinations = db.query(VaccinationRecord).filter(VaccinationRecord.cattle_id == cattle_id).all()
    
    return {
        "cattle_id": cattle_id,
        "consultations": [c.__dict__ for c in consultations],
        "prescriptions": [], # Fetch linked to consultations
        "vaccinations": [v.__dict__ for v in vaccinations]
    }
