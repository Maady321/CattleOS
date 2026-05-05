from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api import deps
from app.models.user import User
from app.models.logs import MilkLog, FeedLog
from app.models.cattle import Cattle
from app.models.farm import Farm

router = APIRouter()

@router.get("/milk-trends")
def get_milk_trends(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get daily milk production trends for the current user's farms.
    """
    results = db.query(
        func.date(MilkLog.created_at).label("date"),
        func.sum(MilkLog.quantity_liters).label("total_liters")
    ).join(Cattle).join(Farm).filter(
        Farm.owner_id == current_user.id
    ).group_by(
        func.date(MilkLog.created_at)
    ).order_by(
        func.date(MilkLog.created_at)
    ).all()
    
    return [{"date": str(r.date), "liters": r.total_liters} for r in results]

@router.get("/feed-costs")
def get_feed_costs(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get feed cost trends.
    """
    results = db.query(
        func.date(FeedLog.created_at).label("date"),
        func.sum(FeedLog.cost).label("total_cost")
    ).join(Cattle).join(Farm).filter(
        Farm.owner_id == current_user.id
    ).group_by(
        func.date(FeedLog.created_at)
    ).order_by(
        func.date(FeedLog.created_at)
    ).all()
    
    return [{"date": str(r.date), "cost": r.total_cost} for r in results]
