from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.dr import BackupVerification, DRPolicy
from app.schemas.dr import DRVerificationResponse, DRDashboardData, DRPolicyResponse
from app.services.dr import DRManagerService
from uuid import UUID

router = APIRouter()

@router.get("/dashboard", response_model=DRDashboardData)
def get_dr_dashboard(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    latest = db.query(BackupVerification).order_by(BackupVerification.created_at.desc()).limit(10).all()
    
    return {
        "recent_verifications": latest,
        "avg_rto_seconds": {"POSTGRES": 125, "REDIS": 15, "S3": 45},
        "compliance_status": "COMPLIANT" if all(v.status == "SUCCESS" for v in latest[:3]) else "NON_COMPLIANT",
        "last_drill_at": latest[0].created_at if latest else None
    }

@router.post("/drills/{resource_type}", response_model=DRVerificationResponse)
def trigger_restore_drill(
    resource_type: str,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Manually triggers a backup restoration drill for a specific resource.
    """
    if resource_type not in ["POSTGRES", "REDIS", "S3"]:
        raise HTTPException(status_code=400, detail="Invalid resource type")
        
    service = DRManagerService(db)
    return service.run_restore_drill(resource_type)

@router.get("/policies", response_model=List[DRPolicyResponse])
def get_dr_policies(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_admin)
) -> Any:
    return db.query(DRPolicy).all()

@router.get("/runbooks")
def get_recovery_runbooks():
    """
    Returns links to internal DR runbooks.
    """
    return {
        "POSTGRES_RESTORE": "https://wiki.cattleos.com/dr/postgres-restore",
        "REDIS_FAILOVER": "https://wiki.cattleos.com/dr/redis-failover",
        "S3_RECOVERY": "https://wiki.cattleos.com/dr/s3-recovery",
        "FULL_REGION_FAILOVER": "https://wiki.cattleos.com/dr/regional-failover"
    }
