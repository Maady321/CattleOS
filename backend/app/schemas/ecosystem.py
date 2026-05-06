from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class PartnerResponse(BaseModel):
    id: UUID
    name: str
    partner_type: str
    rating: float
    
    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    id: UUID
    name: str
    price: float
    category: str
    image_url: Optional[str]
    
    class Config:
        from_attributes = True

class OrderRequest(BaseModel):
    product_id: UUID
    quantity: int

class PartnerDashboardResponse(BaseModel):
    total_sales: float
    net_payout: float
    active_orders: int
    reputation_score: float

class EnterpriseInsightsResponse(BaseModel):
    total_milk_volume_region: float
    average_fat_pct_region: float
    demand_forecast_feed_tons: float
