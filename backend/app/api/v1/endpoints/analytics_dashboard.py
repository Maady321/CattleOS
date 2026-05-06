from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.analytics import FarmMetric
from app.schemas.analytics_dashboard import (
    AnalyticsDashboardResponse, 
    FunnelStep, 
    FeatureUsage, 
    CohortRetention
)
from app.services.analytics_engine import AnalyticsService
from uuid import UUID

router = APIRouter()

@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
def get_product_analytics(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Returns high-level product analytics for the internal team.
    """
    # 1. Activation Funnel (Mocked logic)
    funnel = [
        FunnelStep(step="Signups", count=100, conversion_rate=100.0),
        FunnelStep(step="Onboarded", count=85, conversion_rate=85.0),
        FunnelStep(step="Cattle Added", count=60, conversion_rate=70.5),
        FunnelStep(step="First Milk Log", count=45, conversion_rate=75.0)
    ]
    
    # 2. Feature Usage
    usage = [
        FeatureUsage(feature_name="Voice Entry", active_users=25, total_events=120, trend="UP"),
        FeatureUsage(feature_name="WhatsApp Alerts", active_users=40, total_events=450, trend="STABLE"),
        FeatureUsage(feature_name="Integrity Check", active_users=15, total_events=30, trend="DOWN")
    ]
    
    # 3. Churn Risks (From DB)
    risks = db.query(FarmMetric).filter(FarmMetric.churn_risk_score > 50).limit(5).all()
    # Map to ChurnRiskFarm schema...
    
    # 4. Retention (Mocked)
    retention = [
        CohortRetention(cohort_name="2026-W15", week_0=100, week_1=80, week_2=65, week_4=50),
        CohortRetention(cohort_name="2026-W16", week_0=100, week_1=85, week_2=70, week_4=55)
    ]

    return {
        "activation_funnel": funnel,
        "feature_usage": usage,
        "churn_risks": [], # Map from risks
        "retention_stats": retention
    }

@router.post("/track")
def track_web_event(
    event_name: str,
    properties: dict,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """
    Client-side tracking endpoint.
    """
    service = AnalyticsService(db)
    service.track_event(
        user_id=current_user.id,
        farm_id=current_user.farm_id,
        event_name=event_name,
        category="WEB_INTERACTION",
        properties=properties
    )
    return {"status": "ok"}
