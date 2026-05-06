import uuid
from typing import Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.services.audit_service import audit_service
from app.api.deps import has_permission
from app.core.permissions import Permission

router = APIRouter()

@router.get("/audit-logs", response_model=List[Any])
def get_audit_logs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[uuid.UUID] = None,
    event_type: Optional[str] = None,
    resource_type: Optional[str] = None,
    status: Optional[str] = None,
    current_user: Any = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Superadmin only: View and search audit logs.
    """
    return audit_service.get_logs(
        db, 
        skip=skip, 
        limit=limit, 
        user_id=user_id, 
        event_type=event_type, 
        resource_type=resource_type, 
        status=status
    )

@router.post("/audit-logs/verify-integrity")
def verify_logs_integrity(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Check if audit logs have been tampered with.
    """
    is_valid, broken_id = audit_service.verify_integrity(db)
    if not is_valid:
        return {
            "status": "TAMPERED", 
            "message": f"Integrity check failed at log ID: {broken_id}",
            "is_valid": False
        }
    return {"status": "SECURE", "message": "All audit logs are valid", "is_valid": True}

@router.delete("/audit-logs/cleanup")
def cleanup_logs(
    db: Session = Depends(deps.get_db),
    days: int = 90,
    current_user: Any = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Manually trigger log cleanup.
    """
    deleted_count = audit_service.cleanup_old_logs(db, days=days)
    return {"message": f"Successfully deleted {deleted_count} logs older than {days} days."}
