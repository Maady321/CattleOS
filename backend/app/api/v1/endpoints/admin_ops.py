from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.admin import AdminActionLog
from app.schemas.admin_ops import (
    AdminUserLookup, 
    AdminAuditLogResponse, 
    FailedJobResponse,
    AdminDashboardStats
)
from app.services.admin_ops import AdminService
from uuid import UUID

router = APIRouter()

@router.get("/stats", response_model=AdminDashboardStats)
def get_admin_stats(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    return {
        "total_active_users": 1240,
        "total_active_farms": 10,
        "failed_jobs_count": 5,
        "active_incidents": 1
    }

@router.get("/users/search", response_model=List[AdminUserLookup])
def search_users(
    q: str,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    service = AdminService(db)
    users = service.search_users(q)
    return users

@router.post("/users/{user_id}/impersonate")
def start_impersonation(
    user_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    service = AdminService(db)
    token = service.generate_impersonation_token(current_user.id, user_id)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/users/{user_id}/suspend")
def suspend_account(
    user_id: UUID,
    reason: str,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    service = AdminService(db)
    service.suspend_account(user_id, current_user.id, reason)
    return {"status": "success"}

@router.get("/jobs/failed", response_model=List[FailedJobResponse])
def get_failed_jobs(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    service = AdminService(db)
    return service.get_failed_jobs()

@router.get("/audit", response_model=List[AdminAuditLogResponse])
def get_admin_audit_trail(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    logs = db.query(AdminActionLog).order_by(AdminActionLog.created_at.desc()).limit(100).all()
    # Simplified mapping
    return [
        {
            "id": log.id,
            "operator_email": log.operator.email,
            "action_type": log.action_type,
            "description": log.description,
            "created_at": log.created_at
        } for log in logs
    ]
