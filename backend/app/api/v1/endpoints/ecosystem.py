from typing import Any, List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.marketplace import MarketplacePartner, MarketplaceProduct, MarketplaceOrder
from app.schemas.ecosystem import (
    PartnerResponse, 
    ProductResponse, 
    OrderRequest,
    PartnerDashboardResponse,
    EnterpriseInsightsResponse
)
from app.services.marketplace import MarketplaceService
from uuid import UUID

router = APIRouter()

@router.get("/marketplace/products", response_model=List[ProductResponse])
def list_marketplace_products(
    category: Optional[str] = None,
    db: Session = Depends(deps.get_db)
) -> Any:
    query = db.query(MarketplaceProduct)
    if category:
        query = query.filter(MarketplaceProduct.category == category)
    return query.all()

@router.post("/marketplace/orders", response_model=Dict[str, Any])
def place_order(
    order_in: OrderRequest,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    service = MarketplaceService(db)
    order = service.create_order(current_user.farm_id, order_in.product_id, order_in.quantity)
    return {"order_id": str(order.id), "status": order.status}

@router.get("/partners/dashboard", response_model=PartnerDashboardResponse)
def get_partner_dashboard(
    partner_id: UUID,
    db: Session = Depends(deps.get_db)
) -> Any:
    # Logic for partners to see their sales
    service = MarketplaceService(db)
    payouts = service.get_partner_payouts(partner_id)
    partner = db.query(MarketplacePartner).get(partner_id)
    
    return {
        "total_sales": payouts["gross_revenue"],
        "net_payout": payouts["net_payout"],
        "active_orders": 5, # Mock
        "reputation_score": partner.rating
    }

@router.get("/enterprise/insights", response_model=EnterpriseInsightsResponse)
def get_enterprise_analytics(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Monetized aggregate data for cooperatives and government.
    """
    return {
        "total_milk_volume_region": 125400.5,
        "average_fat_pct_region": 4.1,
        "demand_forecast_feed_tons": 25.5
    }
