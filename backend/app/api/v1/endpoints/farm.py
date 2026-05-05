from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.farm import Farm as FarmModel
from app.schemas.farm import Farm, FarmCreate
from app.services import farm as farm_service

router = APIRouter()

@router.get("/", response_model=List[Farm])
def read_farms(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve farms.
    """
    farms = db.query(FarmModel).filter(FarmModel.owner_id == current_user.id).offset(skip).limit(limit).all()
    return farms

@router.post("/", response_model=Farm)
def create_farm(
    *,
    db: Session = Depends(deps.get_db),
    farm_in: FarmCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new farm.
    """
    farm = FarmModel(
        name=farm_in.name,
        location=farm_in.location,
        owner_id=current_user.id
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm
