from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.api import deps
from app.schemas.sync import SyncPushRequest, SyncResponse
from app.services.sync_service import sync_service

router = APIRouter()

@router.get("/pull", response_model=SyncResponse)
def pull_changes(
    farm_id: UUID,
    last_version: int = 0,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """
    Pull all changes for a farm since last_version.
    """
    # TODO: Verify user has access to farm_id
    return sync_service.pull_changes(db, farm_id, last_version)

@router.post("/push", response_model=SyncResponse)
def push_changes(
    farm_id: UUID,
    push_req: SyncPushRequest,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    """
    Push local changes to the server.
    """
    # TODO: Verify user has access to farm_id
    return sync_service.push_changes(db, farm_id, push_req)
