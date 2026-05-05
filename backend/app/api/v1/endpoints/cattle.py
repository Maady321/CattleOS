from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.cattle import Cattle as CattleModel
from app.schemas.cattle import Cattle, CattleCreate, CattleUpdate

router = APIRouter()

@router.get("/", response_model=List[Cattle])
def read_cattle(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve cattle.
    """
    # Join with Farm to ensure ownership
    from app.models.farm import Farm
    cattle = db.query(CattleModel).join(Farm).filter(Farm.owner_id == current_user.id).offset(skip).limit(limit).all()
    return cattle

@router.post("/", response_model=Cattle)
def create_cattle(
    *,
    db: Session = Depends(deps.get_db),
    cattle_in: CattleCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new cattle.
    """
    # Verify farm ownership
    from app.models.farm import Farm
    farm = db.query(Farm).filter(Farm.id == cattle_in.farm_id, Farm.owner_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or access denied")
        
    cattle = CattleModel(**cattle_in.dict())
    db.add(cattle)
    db.commit()
    db.refresh(cattle)
    return cattle
