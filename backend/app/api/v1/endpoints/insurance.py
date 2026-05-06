from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.insurance import InsurancePolicy, InsuranceClaim, PolicyStatus, ClaimStatus
from app.schemas.insurance import (
    InsurancePolicyResponse, 
    InsuranceClaimCreate, 
    InsuranceClaimResponse,
    InsuranceDashboard
)
from app.services.insurance import InsuranceService
from uuid import UUID

router = APIRouter()

@router.get("/dashboard", response_model=InsuranceDashboard)
def get_insurance_dashboard(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    policies = db.query(InsurancePolicy).filter(
        InsurancePolicy.farm_id == current_user.farm_id,
        InsurancePolicy.status == PolicyStatus.ACTIVE
    ).all()
    
    claims = db.query(InsuranceClaim).filter(
        InsuranceClaim.farm_id == current_user.farm_id,
        InsuranceClaim.status.in_([ClaimStatus.SUBMITTED, ClaimStatus.UNDER_INVESTIGATION])
    ).all()
    
    service = InsuranceService(db)
    expiring = db.query(InsurancePolicy).filter(
        InsurancePolicy.farm_id == current_user.farm_id,
        InsurancePolicy.status == PolicyStatus.ACTIVE
    ).limit(5).all() # Simplified
    
    return {
        "active_policies": len(policies),
        "total_insured_value": sum(p.sum_assured for p in policies),
        "pending_claims": len(claims),
        "expiring_soon": expiring
    }

@router.post("/claims", response_model=InsuranceClaimResponse)
def file_new_claim(
    claim_in: InsuranceClaimCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    service = InsuranceService(db)
    return service.file_claim(
        claim_in.policy_id,
        claim_in.claim_type,
        claim_in.incident_date,
        claim_in.documents
    )

@router.get("/policies", response_model=List[InsurancePolicyResponse])
def list_farm_policies(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    return db.query(InsurancePolicy).filter(
        InsurancePolicy.farm_id == current_user.farm_id
    ).all()

@router.get("/claims/{claim_id}", response_model=InsuranceClaimResponse)
def get_claim_details(
    claim_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    claim = db.query(InsuranceClaim).filter(
        InsuranceClaim.id == claim_id,
        InsuranceClaim.farm_id == current_user.farm_id
    ).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim
