from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.api import deps
from app.models.cooperative import Cooperative, Settlement, CooperativeCollection
from app.schemas.cooperative import (
    CooperativeResponse, 
    ReconciliationReport, 
    SettlementResponse,
    CooperativeDashboard
)
from app.services.cooperative import CooperativeSyncService
from uuid import UUID

router = APIRouter()

@router.get("/my-coops", response_model=List[CooperativeResponse])
def list_linked_coops(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    return db.query(Cooperative).filter(Cooperative.is_active == True).all()

@router.get("/dashboard", response_model=CooperativeDashboard)
def get_coop_dashboard(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    service = CooperativeSyncService(db)
    discrepancies = service.reconcile_collections(current_user.farm_id)
    
    return {
        "total_liters_poured": 1250.5, # Mock
        "avg_fat_pct": 4.2,
        "pending_settlement": 8400.0,
        "last_sync": datetime.utcnow(),
        "discrepancy_count": len(discrepancies)
    }

@router.get("/reconciliation", response_model=List[ReconciliationReport])
def get_reconciliation_report(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    service = CooperativeSyncService(db)
    return service.reconcile_collections(current_user.farm_id)

@router.get("/settlements", response_model=List[SettlementResponse])
def get_settlement_history(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    return db.query(Settlement).filter(Settlement.farm_id == current_user.farm_id).order_by(Settlement.period_end.desc()).all()

@router.post("/webhooks/cooperative")
async def cooperative_webhook(
    request: Request,
    db: Session = Depends(deps.get_db)
):
    """
    Receives collection data directly from the cooperative's IoT/Collection system.
    """
    payload = await request.json()
    service = CooperativeSyncService(db)
    service.process_incoming_collection(payload)
    return {"status": "recorded"}
