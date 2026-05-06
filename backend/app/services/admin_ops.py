import logging
import json
import redis
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.farm import Farm
from app.models.admin import AdminActionLog, AdminActionType, FeatureFlag
from app.core.config import settings
from app.core.security import create_access_token

logger = logging.getLogger(__name__)
redis_client = redis.from_url(settings.REDIS_URL)

class AdminService:
    def __init__(self, db: Session):
        self.db = db

    def search_users(self, query: str) -> List[User]:
        return self.db.query(User).filter(
            (User.email.ilike(f"%{query}%")) | (User.full_name.ilike(f"%{query}%"))
        ).limit(20).all()

    def suspend_account(self, user_id: UUID, operator_id: UUID, reason: str):
        user = self.db.query(User).get(user_id)
        if user:
            user.is_active = False
            self._log_action(operator_id, AdminActionType.ACCOUNT_SUSPEND, f"Suspended: {reason}", target_user_id=user_id)
            # Force logout by revoking all tokens in Redis
            redis_client.delete(f"refresh_tokens:{user_id}")
            self.db.commit()

    def generate_impersonation_token(self, operator_id: UUID, target_user_id: UUID) -> str:
        """
        Generates a short-lived access token for a target user.
        Strictly logged for audit compliance.
        """
        target_user = self.db.query(User).get(target_user_id)
        operator = self.db.query(User).get(operator_id)
        
        if not target_user: raise ValueError("User not found")
        
        self._log_action(
            operator_id, 
            AdminActionType.IMPERSONATION_START, 
            f"Operator {operator.email} impersonating {target_user.email}",
            target_user_id=target_user_id
        )
        
        # Token with a special "impersonator_id" claim
        return create_access_token(
            subject=str(target_user.id),
            expires_delta=timedelta(minutes=30),
            additional_claims={"impersonator_id": str(operator_id)}
        )

    def get_failed_jobs(self) -> List[Dict[str, Any]]:
        """
        Inspects the Celery failed queue (stored in Redis or a custom DB table).
        """
        # Mocking queue inspection
        return [
            {"id": "task-123", "name": "process_milk_logs", "error": "Database Timeout", "time": "10m ago"},
            {"id": "task-456", "name": "send_whatsapp_alert", "error": "Rate Limit Exceeded", "time": "25m ago"}
        ]

    def replay_job(self, task_id: str, operator_id: UUID):
        self._log_action(operator_id, AdminActionType.WORKFLOW_REPLAY, f"Replaying task: {task_id}")
        # Logic to trigger Celery retry
        return True

    def _log_action(self, operator_id: UUID, action_type: AdminActionType, description: str, **kwargs):
        log = AdminActionLog(
            operator_id=operator_id,
            action_type=action_type,
            description=description,
            target_user_id=kwargs.get("target_user_id"),
            target_farm_id=kwargs.get("target_farm_id")
        )
        self.db.add(log)
        self.db.commit()
