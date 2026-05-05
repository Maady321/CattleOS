from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.api import deps
from app.core.rbac import has_permission, Permission
from app.models.user import User, UserRole
from app.services.invitation_service import invitation_service
from app.services import user as user_service
from pydantic import BaseModel, EmailStr

router = APIRouter()

class InvitationCreate(BaseModel):
    email: EmailStr
    role: UserRole

@router.post("/invite", dependencies=[Depends(has_permission([Permission.INVITE_USERS])), Depends(deps.verify_csrf)])
def invite_user(
    *,
    db: Session = Depends(deps.get_db),
    invite_in: InvitationCreate,
    current_user: User = Depends(deps.get_current_active_user),
    request: Request
) -> Any:
    """
    Invite a new user with a specific role.
    """
    return invitation_service.create_invitation(
        db, 
        email=invite_in.email, 
        role=invite_in.role, 
        invited_by=current_user,
        request=request
    )

@router.get("/", dependencies=[Depends(has_permission([Permission.MANAGE_USERS]))])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve users (Admin only).
    """
    return db.query(User).offset(skip).limit(limit).all()

@router.put("/{user_id}/role", dependencies=[Depends(has_permission([Permission.MANAGE_USERS])), Depends(deps.verify_csrf)])
def update_user_role(
    *,
    db: Session = Depends(deps.get_db),
    user_id: str,
    role: UserRole,
    current_user: User = Depends(deps.get_current_active_user),
    request: Request
) -> Any:
    """
    Update a user's role (Admin only).
    """
    user = user_service.get_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = user_service.update(db, db_obj=user, obj_in={"role": role})
    
    from app.services.audit_service import audit_service
    audit_service.log_event(
        db, 
        "USER_ROLE_UPDATED", 
        user_id=current_user.id, 
        request=request, 
        metadata={"target_user_id": str(user_id), "new_role": role.value}
    )
    
    return updated_user
