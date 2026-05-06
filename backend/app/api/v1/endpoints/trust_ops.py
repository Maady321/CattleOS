from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.trust import VerificationRequest, PlatformHealth, TransparencyReport
from app.schemas.trust_ops import (
    VerificationSubmission, 
    HealthStatusResponse, 
    TransparencyReportResponse,
    TrustScoreResponse
)
from app.services.trust import TrustService
from uuid import UUID

router = APIRouter()

@router.get("/health", response_model=List[HealthStatusResponse])
def get_public_platform_health(
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Public endpoint showing real-time platform availability.
    """
    service = TrustService(db)
    return service.get_platform_health()

@router.post("/verify", response_model=Dict[str, Any])
def submit_for_verification(
    req_in: VerificationSubmission,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    service = TrustService(db)
    req = service.submit_verification(
        target_id=current_user.id,
        entity_type=req_in.entity_type,
        docs=req_in.document_urls
    )
    return {"id": str(req.id), "status": req.status}

@router.get("/reports", response_model=List[TransparencyReportResponse])
def get_transparency_reports(
    db: Session = Depends(deps.get_db)
) -> Any:
    return db.query(TransparencyReport).filter(TransparencyReport.is_public == True).all()

@router.get("/score/{farm_id}", response_model=TrustScoreResponse)
def get_farm_trust_score(
    farm_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    service = TrustService(db)
    score = service.calculate_data_trust_score(farm_id)
    
    # Check for active verification
    v_status = db.query(VerificationRequest).filter(
        VerificationRequest.target_id == farm_id
    ).first()
    
    return {
        "farm_id": farm_id,
        "score": score,
        "badges": ["DATA_INTEGRITY_CERTIFIED"] if score > 90 else [],
        "verification_status": v_status.status if v_status else "NONE"
    }
