from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.growth import PMFSurvey, Referral
from app.schemas.growth_ops import (
    PMFSubmission, 
    ReferralResponse, 
    GrowthDashboardResponse
)
from app.services.growth import GrowthService
from uuid import UUID

router = APIRouter()

@router.get("/dashboard", response_model=GrowthDashboardResponse)
def get_growth_dashboard(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    service = GrowthService(db)
    pmf = service.calculate_pmf_score()
    
    return {
        "pmf_score": pmf["score"],
        "pmf_status": "ACHIEVED" if pmf.get("is_pmf_achieved") else "GROWING",
        "viral_coefficient": 0.4, # Mocked K-factor
        "top_feature_requests": service.get_feature_demand(),
        "total_referrals": db.query(Referral).count()
    }

@router.post("/pmf", response_model=Dict[str, Any])
def submit_pmf_survey(
    survey_in: PMFSubmission,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    survey = PMFSurvey(
        farm_id=current_user.farm_id,
        response=survey_in.response,
        feedback_text=survey_in.feedback_text,
        can_use_as_testimonial=survey_in.can_use_as_testimonial
    )
    db.add(survey)
    db.commit()
    return {"status": "recorded"}

@router.post("/referral", response_model=Dict[str, str])
def create_referral(
    email: str,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    service = GrowthService(db)
    code = service.generate_referral(current_user.farm_id, email)
    return {"referral_code": code}

@router.get("/testimonials", response_model=List[Dict[str, Any]])
def get_public_testimonials(
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Returns verified testimonials from the PMF survey.
    """
    testimonials = db.query(PMFSurvey).filter(PMFSurvey.can_use_as_testimonial == True).limit(5).all()
    return [
        {"text": t.feedback_text, "farm_id": t.farm_id} for t in testimonials
    ]
