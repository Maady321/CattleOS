from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.cattle import Cattle as CattleModel
from app.schemas.cattle import Cattle, CattleCreate, CattleUpdate

router = APIRouter()

from app.core.rbac import Permission

@router.get("/", response_model=List[Cattle])
def read_cattle(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve cattle for all farms the user is a member of.
    """
    from app.models.farm import Farm, FarmMembership
    cattle = db.query(CattleModel).join(Farm).join(FarmMembership).filter(
        FarmMembership.user_id == current_user.id,
        FarmMembership.status == "ACTIVE",
        Farm.is_deleted == False
    ).offset(skip).limit(limit).all()
    return cattle

@router.post("/", response_model=Cattle)
def create_cattle(
    *,
    db: Session = Depends(deps.get_db),
    cattle_in: CattleCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new cattle.
    """
    # Verify farm access and permission
    from app.services.resource_auth_service import resource_auth_service
    resource_auth_service.authorize_resource_access(
        db, current_user, "farm", cattle_in.farm_id, Permission.MANAGE_RESOURCES
    )
        
    cattle = CattleModel(**cattle_in.model_dump())
    db.add(cattle)
    db.commit()
    db.refresh(cattle)
    return cattle

@router.get("/{resource_id}", response_model=Cattle)
def read_cattle_by_id(
    *,
    db: Session = Depends(deps.get_db),
    resource_id: str = Depends(deps.ResourceAccess("cattle", Permission.VIEW_RESOURCES)),
) -> Any:
    """
    Get a specific cattle by ID with ownership verification.
    """
    return db.query(CattleModel).filter(CattleModel.id == resource_id).first()
