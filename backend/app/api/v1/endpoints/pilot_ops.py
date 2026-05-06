from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.success import FarmScorecard
from app.schemas.pilot_ops import (
    PilotSuccessScoreResponse, 
    CohortBenchmarkResponse, 
    FieldOpsDashboardResponse
)
from app.services.pilot_ops import PilotSuccessService
from uuid import UUID

router = APIRouter()

@router.get("/dashboard", response_model=FieldOpsDashboardResponse)
def get_field_ops_dashboard(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Command center for field agents managing the 100-farm pilot.
    """
    total_farms = db.query(FarmScorecard).count()
    at_risk = db.query(FarmScorecard).filter(FarmScorecard.health_score < 60).all()
    
    return {
        "active_deployments": total_farms,
        "at_risk_farms": [{"id": f.farm_id, "score": f.health_score} for f in at_risk],
        "pending_visits": len(at_risk),
        "avg_ttv_days": 4.5 # Mocked TTV
    }

@router.get("/scorecard/{farm_id}", response_model=PilotSuccessScoreResponse)
def get_pilot_scorecard(
    farm_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    service = PilotSuccessService(db)
    return service.calculate_pilot_success_score(farm_id)

@router.get("/benchmarks", response_model=CohortBenchmarkResponse)
def get_pilot_benchmarks(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    service = PilotSuccessService(db)
    return service.get_cohort_benchmarks()
