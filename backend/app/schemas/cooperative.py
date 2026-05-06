from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class CooperativeResponse(BaseModel):
    id: UUID
    name: str
    is_active: bool
    
    class Config:
        from_attributes = True

class ReconciliationReport(BaseModel):
    local_id: str
    ext_id: str
    diff: float
    type: str

class SettlementResponse(BaseModel):
    id: UUID
    period_start: datetime
    period_end: datetime
    net_amount: float
    payment_status: str
    payment_reference: Optional[str]
    
    class Config:
        from_attributes = True

class CooperativeDashboard(BaseModel):
    total_liters_poured: float
    avg_fat_pct: float
    pending_settlement: float
    last_sync: Optional[datetime]
    discrepancy_count: int
