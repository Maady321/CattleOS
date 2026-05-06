from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.models.operations import SupportTicket, CustomerFeedback, FarmOnboarding
from app.models.farm import Farm
from app.schemas.operations import (
    SupportTicketCreate, 
    SupportTicketResponse, 
    FeedbackCreate, 
    OnboardingStatus,
    SuccessMetricSummary
)
from app.services.provisioning import ProvisioningService
from uuid import UUID

router = APIRouter()

@router.get("/onboarding", response_model=OnboardingStatus)
def get_onboarding_status(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    onboarding = db.query(FarmOnboarding).filter(FarmOnboarding.farm_id == current_user.farm_id).first()
    if not onboarding:
        raise HTTPException(status_code=404, detail="Onboarding not found")
        
    service = ProvisioningService(db)
    scores = service.calculate_success_scores(current_user.farm_id)
    
    return {
        "step_completed": onboarding.step_completed,
        "is_wizard_completed": onboarding.is_wizard_completed,
        "checklist": onboarding.checklist_json,
        "activation_score": scores["activation_score"],
        "churn_risk": scores["churn_risk"]
    }

@router.post("/tickets", response_model=SupportTicketResponse)
def create_support_ticket(
    ticket_in: SupportTicketCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    ticket = SupportTicket(
        **ticket_in.dict(),
        farm_id=current_user.farm_id,
        user_id=current_user.id,
        status="OPEN"
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

@router.post("/feedback")
def submit_feedback(
    feedback_in: FeedbackCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    feedback = CustomerFeedback(
        **feedback_in.dict(),
        farm_id=current_user.farm_id,
        user_id=current_user.id
    )
    db.add(feedback)
    db.commit()
    return {"status": "success"}

@router.get("/admin/success-metrics", response_model=List[SuccessMetricSummary])
def get_admin_success_dashboard(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Returns high-level metrics for the first pilot farms.
    """
    farms = db.query(Farm).all()
    service = ProvisioningService(db)
    results = []
    
    for farm in farms:
        scores = service.calculate_success_scores(farm.id)
        open_tickets = db.query(SupportTicket).filter(
            SupportTicket.farm_id == farm.id,
            SupportTicket.status == "OPEN"
        ).count()
        
        results.append({
            "farm_id": farm.id,
            "farm_name": farm.name,
            "activation_score": scores["activation_score"],
            "churn_risk": scores["churn_risk"],
            "last_active": None, # Should be derived from logs
            "open_tickets": open_tickets
        })
        
    return results
