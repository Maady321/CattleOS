from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class PlanResponse(BaseModel):
    id: UUID
    name: str
    amount: float
    currency: str
    interval: str
    trial_days: int
    features_json: Dict[str, Any]
    
    class Config:
        from_attributes = True

class SubscriptionResponse(BaseModel):
    id: UUID
    status: str
    current_period_end: datetime
    cancel_at_period_end: bool
    plan: PlanResponse
    
    class Config:
        from_attributes = True

class InvoiceResponse(BaseModel):
    id: UUID
    razorpay_payment_id: str
    total_amount: float
    tax_amount: float
    status: str
    created_at: datetime
    invoice_pdf_url: Optional[str]
    
    class Config:
        from_attributes = True

class BillingDashboardData(BaseModel):
    subscription: Optional[SubscriptionResponse]
    recent_invoices: List[InvoiceResponse]
    upcoming_invoice_date: Optional[datetime]
    upcoming_invoice_amount: float
    usage_stats: Dict[str, Any]
