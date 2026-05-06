from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class PMFSubmission(BaseModel):
    response: str
    feedback_text: Optional[str]
    can_use_as_testimonial: bool

class ReferralResponse(BaseModel):
    referral_code: str
    referred_email: str
    status: str
    created_at: datetime

class GrowthDashboardResponse(BaseModel):
    pmf_score: float
    pmf_status: str # ACHIEVED, GROWING
    viral_coefficient: float # K-factor
    top_feature_requests: List[Dict[str, Any]]
    total_referrals: int
