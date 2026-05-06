from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.success import FarmScorecard, CSIncident, SuccessMilestone
from app.schemas.success import (
    ScorecardResponse, 
    CSDashboardResponse, 
    CSIncidentCreate
)
from app.services.success import CustomerSuccessService
from uuid import UUID

router = APIRouter()

@router.get("/dashboard", response_model=CSDashboardResponse)
def get_customer_success_dashboard(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    """
    High-level dashboard for the CS team to monitor the first 100 farms.
    """
    total_farms = db.query(FarmScorecard).count()
    risks = db.query(FarmScorecard).filter(FarmScorecard.health_score < 40).all()
    incidents = db.query(CSIncident).filter(CSIncident.status == "OPEN").count()
    
    return {
        "active_farms": total_farms,
        "onboarding_count": 15, # Mock
        "avg_health_score": 82.5,
        "churn_watchlist": [
            {"farm_id": r.farm_id, "score": r.health_score} for r in risks
        ],
        "open_incidents_count": incidents
    }

@router.get("/scorecard/{farm_id}", response_model=ScorecardResponse)
def get_farm_scorecard(
    farm_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    card = db.query(FarmScorecard).filter(FarmScorecard.farm_id == farm_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Scorecard not found")
    return card

@router.post("/incidents", response_model=Dict[str, Any])
def report_cs_incident(
    incident_in: CSIncidentCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """
    Allows farmers or CSMs to report issues (Training, Data etc.)
    """
    incident = CSIncident(
        farm_id=current_user.farm_id,
        category=incident_in.category,
        severity=incident_in.severity,
        summary=incident_in.summary,
        status="OPEN"
    )
    db.add(incident)
    db.commit()
    return {"id": str(incident.id), "status": "OPEN"}

@router.post("/scorecard/{farm_id}/nps")
def update_nps(
    farm_id: UUID,
    score: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    card = db.query(FarmScorecard).filter(FarmScorecard.farm_id == farm_id).first()
    if card:
        card.nps_score = score
        card.last_survey_at = datetime.utcnow()
        db.commit()
    return {"status": "recorded"}
