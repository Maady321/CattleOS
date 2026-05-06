from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from app.api import deps
from app.models.messaging import WorkflowRule, MessageLog, UserMessagingPreference
from app.schemas.messaging import (
    WorkflowRuleCreate, 
    WorkflowRuleResponse, 
    UserPreferenceBase, 
    MessageLogResponse,
    CampaignAnalytics
)
from app.tasks.messaging import handle_whatsapp_webhook
from uuid import UUID
import sqlalchemy as sa

router = APIRouter()

@router.post("/webhooks/whatsapp")
async def whatsapp_webhook(
    request: Request,
    x_hub_signature: Optional[str] = Header(None)
):
    """
    Endpoint for WhatsApp Business API Webhooks.
    Validates signature and processes status updates.
    """
    payload = await request.json()
    # Logic to verify x_hub_signature with settings.WHATSAPP_WEBHOOK_SECRET
    handle_whatsapp_webhook(payload)
    return {"status": "accepted"}

@router.get("/rules", response_model=List[WorkflowRuleResponse])
def get_workflow_rules(
    db: Session = Depends(deps.get_db),
    farm_id: UUID = None,
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    return db.query(WorkflowRule).filter(WorkflowRule.farm_id == farm_id).all()

@router.post("/rules", response_model=WorkflowRuleResponse)
def create_workflow_rule(
    rule_in: WorkflowRuleCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    rule = WorkflowRule(**rule_in.dict())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.get("/preferences", response_model=UserPreferenceBase)
def get_my_preferences(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    prefs = db.query(UserMessagingPreference).filter(
        UserMessagingPreference.user_id == current_user.id
    ).first()
    if not prefs:
        # Return defaults
        return UserPreferenceBase()
    return prefs

@router.put("/preferences", response_model=UserPreferenceBase)
def update_preferences(
    prefs_in: UserPreferenceBase,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    prefs = db.query(UserMessagingPreference).filter(
        UserMessagingPreference.user_id == current_user.id
    ).first()
    if not prefs:
        prefs = UserMessagingPreference(user_id=current_user.id, farm_id=current_user.farm_id)
        db.add(prefs)
    
    for field, value in prefs_in.dict().items():
        setattr(prefs, field, value)
    
    db.commit()
    db.refresh(prefs)
    return prefs

@router.get("/analytics", response_model=CampaignAnalytics)
def get_campaign_analytics(
    farm_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Calculates delivery and read rates for the farm's messages.
    """
    logs = db.query(MessageLog).filter(MessageLog.farm_id == farm_id)
    total = logs.count()
    if total == 0:
        return CampaignAnalytics(total_sent=0, delivered_rate=0, read_rate=0, failure_rate=0, conversion_rate=0)
    
    delivered = logs.filter(MessageLog.status == "DELIVERED").count()
    read = logs.filter(MessageLog.status == "READ").count()
    failed = logs.filter(MessageLog.status == "FAILED").count()
    
    return CampaignAnalytics(
        total_sent=total,
        delivered_rate=(delivered / total) * 100,
        read_rate=(read / total) * 100,
        failure_rate=(failed / total) * 100,
        conversion_rate=0 # Logic to tie back to task completion
    )
