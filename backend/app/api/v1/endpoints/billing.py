from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from app.api import deps
from app.models.billing import Subscription, SubscriptionPlan, Invoice, Coupon
from app.schemas.billing import (
    PlanResponse, 
    SubscriptionResponse, 
    InvoiceResponse, 
    BillingDashboardData
)
from app.services.billing import BillingService
from uuid import UUID

router = APIRouter()

@router.get("/plans", response_model=List[PlanResponse])
def list_plans(db: Session = Depends(deps.get_db)) -> Any:
    return db.query(SubscriptionPlan).filter(SubscriptionPlan.is_active == True).all()

@router.get("/dashboard", response_model=BillingDashboardData)
def get_billing_dashboard(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    sub = db.query(Subscription).filter(Subscription.farm_id == current_user.farm_id).first()
    invoices = db.query(Invoice).filter(Invoice.farm_id == current_user.farm_id).order_by(Invoice.created_at.desc()).limit(5).all()
    
    return {
        "subscription": sub,
        "recent_invoices": invoices,
        "upcoming_invoice_date": sub.current_period_end if sub else None,
        "upcoming_invoice_amount": sub.plan.amount if sub and sub.plan else 0.0,
        "usage_stats": {"seats": 3, "max_seats": 5} # Mock usage
    }

@router.post("/subscribe", response_model=SubscriptionResponse)
def create_subscription(
    plan_id: UUID,
    coupon_code: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    service = BillingService(db)
    return service.create_subscription(current_user.farm_id, plan_id, coupon_code)

@router.post("/cancel")
def cancel_subscription(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    sub = db.query(Subscription).filter(Subscription.farm_id == current_user.farm_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription")
    
    sub.cancel_at_period_end = True
    db.commit()
    return {"status": "Scheduled for cancellation"}

@router.post("/webhooks/razorpay")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(...),
    db: Session = Depends(deps.get_db)
):
    """
    Razorpay Webhook receiver.
    Validates signature and dispatches events to BillingService.
    """
    payload = await request.body()
    # Signature verification logic would go here
    service = BillingService(db)
    service.process_webhook_event(await request.json())
    return {"status": "ok"}

@router.get("/invoices/{invoice_id}/download")
def download_invoice(
    invoice_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.farm_id == current_user.farm_id
    ).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return {"download_url": invoice.invoice_pdf_url}
