from fastapi import APIRouter
from app.api.v1.endpoints import (
    operations, 
    success, 
    analytics_dashboard, 
    admin_ops, 
    observability, 
    dr,
    integrity
)

router = APIRouter()

# Grouping all Internal/Ops logic under a single umbrella
router.include_router(admin_ops.router, prefix="/admin", tags=["admin"])
router.include_router(analytics_dashboard.router, prefix="/analytics", tags=["analytics"])
router.include_router(success.router, prefix="/success", tags=["success"])
router.include_router(observability.router, prefix="/observability", tags=["observability"])
router.include_router(dr.router, prefix="/dr", tags=["dr"])
router.include_router(integrity.router, prefix="/integrity", tags=["integrity"])
router.include_router(operations.router, prefix="/pilot", tags=["pilot_ops"])
