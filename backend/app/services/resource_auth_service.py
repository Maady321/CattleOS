import uuid
import logging
from typing import Optional, Any, Tuple
from sqlalchemy.orm import Session
from app.models.farm import Farm, FarmMembership
from app.models.user import User, UserRole
from app.models.cattle import Cattle
from app.core.rbac import rbac_manager, Permission
from app.services.audit_service import audit_service
from fastapi import HTTPException, status, Request

logger = logging.getLogger("security.resource_auth")

class ResourceAuthService:
    def get_resource_farm_id(self, db: Session, resource_type: str, resource_id: Any) -> Optional[uuid.UUID]:
        """
        Centralized resolver for finding the parent farm of any resource.
        """
        from app.models import Cattle, HealthLog, MilkLog, FeedLog, BreedingLog, Alert, Document, Farm
        
        try:
            if resource_type == "farm":
                return uuid.UUID(str(resource_id))
            
            if resource_type == "cattle":
                res = db.query(Cattle.farm_id).filter(Cattle.id == resource_id).first()
                return res[0] if res else None
            
            if resource_type in ["health_log", "milk_log", "feed_log", "breeding_log"]:
                # These logs belong to a cattle, which belongs to a farm
                model_map = {
                    "health_log": HealthLog,
                    "milk_log": MilkLog,
                    "feed_log": FeedLog,
                    "breeding_log": BreedingLog
                }
                model = model_map[resource_type]
                res = db.query(Cattle.farm_id).join(model).filter(model.id == resource_id).first()
                return res[0] if res else None

            if resource_type == "document":
                res = db.query(Document.farm_id).filter(Document.id == resource_id).first()
                return res[0] if res else None

            if resource_type == "alert":
                # Alerts might be user-specific or farm-specific, here we assume farm-scoped alerts
                res = db.query(Alert.metadata_json["farm_id"]).filter(Alert.id == resource_id).first()
                return uuid.UUID(res[0]) if res else None
            
            return None
        except Exception as e:
            logger.error(f"Error resolving farm for {resource_type}:{resource_id} -> {str(e)}")
            return None

    def authorize_resource_access(
        self,
        db: Session,
        user: User,
        resource_type: str,
        resource_id: Any,
        permission: Permission,
        request: Optional[Request] = None
    ):
        """
        Comprehensive authorization check to prevent IDOR and unauthorized access.
        """
        # 1. Superadmin bypass
        if user.is_superuser:
            return True

        # 2. Resolve Farm ID
        farm_id = self.get_resource_farm_id(db, resource_type, resource_id)
        if not farm_id:
            self._log_denial(db, user, resource_type, resource_id, "RESOURCE_NOT_FOUND", request)
            raise HTTPException(status_code=404, detail="Resource not found")

        # 3. Check Farm Status
        farm = db.query(Farm).filter(Farm.id == farm_id).first()
        if not farm or farm.is_deleted or farm.status != "ACTIVE":
            self._log_denial(db, user, resource_type, resource_id, "FARM_INACTIVE", request)
            raise HTTPException(status_code=403, detail="Farm is suspended or inactive")

        # 4. Check Active Membership
        membership = db.query(FarmMembership).filter(
            FarmMembership.user_id == user.id,
            FarmMembership.farm_id == farm_id,
            FarmMembership.status == "ACTIVE"
        ).first()

        if not membership:
            self._log_denial(db, user, resource_type, resource_id, "NO_MEMBERSHIP", request)
            raise HTTPException(status_code=403, detail="Access denied. You are not a member of this farm.")

        # 5. Check Role Permissions within this farm
        # membership.role is a string like "manager", "worker"
        if not rbac_manager.has_permission(membership.role, permission):
            self._log_denial(db, user, resource_type, resource_id, "INSUFFICIENT_PERMISSIONS", request)
            raise HTTPException(status_code=403, detail="Insufficient permissions for this action")

        return True

    def _log_denial(self, db: Session, user: User, resource_type: str, resource_id: Any, reason: str, request: Optional[Request]):
        audit_service.log_event(
            db,
            "ACCESS_DENIED",
            action="READ_WRITE", # Generic
            user_id=user.id,
            resource_type=resource_type,
            resource_id=str(resource_id),
            status="FAILURE",
            metadata={"reason": reason},
            request=request
        )
        logger.warning(f"Auth Denied | User: {user.id} | Resource: {resource_type}:{resource_id} | Reason: {reason}")

resource_auth_service = ResourceAuthService()
