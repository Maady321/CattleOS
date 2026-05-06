from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.core.integrity_engine import IntegrityEngine
from app.models.integrity import DataAnomaly, IntegrityCheck, DataCorrection
from app.schemas.integrity import (
    AnomalyResponse, 
    IntegrityCheckResponse, 
    CorrectionCreate, 
    CorrectionResponse,
    DashboardStats
)
from uuid import UUID

router = APIRouter()

@router.get("/dashboard", response_model=DashboardStats)
def get_integrity_dashboard(
    db: Session = Depends(deps.get_db),
    farm_id: UUID = Query(...),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """
    Returns high-level integrity stats for the farm.
    """
    # Count open anomalies
    anomalies_count = db.query(DataAnomaly).filter(
        DataAnomaly.farm_id == farm_id,
        DataAnomaly.is_resolved == False
    ).count()
    
    # Last check status
    last_check = db.query(IntegrityCheck).filter(
        IntegrityCheck.farm_id == farm_id
    ).order_by(IntegrityCheck.created_at.desc()).first()
    
    # Missing data summary
    # ...
    
    return {
        "open_anomalies": anomalies_count,
        "last_check_status": last_check.status if last_check else "NEVER_RUN",
        "last_check_at": last_check.created_at if last_check else None,
        "health_score": 95 # Placeholder logic
    }

@router.post("/reconcile", response_model=IntegrityCheckResponse)
def trigger_reconciliation(
    farm_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Triggers a manual reconciliation job.
    """
    engine = IntegrityEngine(db)
    check = engine.run_reconciliation(farm_id, None, None) # Dates would be params
    return check

@router.get("/anomalies", response_model=List[AnomalyResponse])
def list_anomalies(
    farm_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    return db.query(DataAnomaly).filter(DataAnomaly.farm_id == farm_id).all()

@router.post("/corrections", response_model=CorrectionResponse)
def propose_correction(
    correction: CorrectionCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """
    Propose a correction for an anomaly.
    """
    new_correction = DataCorrection(
        **correction.dict(),
        user_id=current_user.id,
        status="PENDING"
    )
    db.add(new_correction)
    db.commit()
    db.refresh(new_correction)
    return new_correction

@router.post("/corrections/{correction_id}/approve")
def approve_correction(
    correction_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Admin approval of a data correction.
    """
    engine = IntegrityEngine(db)
    success = engine.apply_correction(correction_id, current_user.id)
    if not success:
        raise HTTPException(status_code=400, detail="Correction could not be applied")
    return {"status": "success"}
