import uuid
import logging
import json
from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Dict, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import Request, BackgroundTasks
from app.models.audit_log import AuditLog

logger = logging.getLogger("app.audit")

class AuditService:
    def _get_last_log_hash(self, db: Session) -> str:
        last_log = db.query(AuditLog).order_by(desc(AuditLog.created_at)).first()
        return last_log.log_hash if last_log else "INITIAL_BLOCK"

    def log_event(
        self,
        db: Session,
        event_type: str,
        action: Optional[str] = None,
        user_id: Optional[uuid.UUID] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        status: str = "SUCCESS",
        request: Optional[Request] = None
    ) -> AuditLog:
        """
        Synchronous log creation with hash chaining.
        """
        ip = request.client.host if request else None
        ua = request.headers.get("user-agent") if request else None
        
        prev_hash = self._get_last_log_hash(db)
        
        log_entry = AuditLog(
            event_type=event_type,
            action=action,
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_json=metadata or {},
            status=status,
            ip_address=ip,
            user_agent=ua,
            previous_hash=prev_hash,
            log_hash="" # Placeholder
        )
        
        log_entry.log_hash = log_entry.calculate_hash(prev_hash)
        
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        
        # System logging for redundancy
        logger.info(f"AUDIT | {event_type} | {status} | User: {user_id} | Resource: {resource_type}:{resource_id}")
        
        return log_entry

    def log_event_async(
        self,
        db: Session,
        background_tasks: BackgroundTasks,
        **kwargs
    ):
        """
        Offloads logging to background tasks to keep the API responsive.
        """
        background_tasks.add_task(self.log_event, db, **kwargs)

    def get_logs(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        user_id: Optional[uuid.UUID] = None,
        event_type: Optional[str] = None,
        resource_type: Optional[str] = None,
        status: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[AuditLog]:
        query = db.query(AuditLog)
        
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if event_type:
            query = query.filter(AuditLog.event_type == event_type)
        if resource_type:
            query = query.filter(AuditLog.resource_type == resource_type)
        if status:
            query = query.filter(AuditLog.status == status)
        if start_date:
            query = query.filter(AuditLog.created_at >= start_date)
        if end_date:
            query = query.filter(AuditLog.created_at <= end_date)
            
        return query.order_by(desc(AuditLog.created_at)).offset(skip).limit(limit).all()

    def verify_integrity(self, db: Session) -> Tuple[bool, Optional[uuid.UUID]]:
        """
        Verifies the hash chain of all logs.
        Returns (is_valid, first_broken_log_id).
        """
        logs = db.query(AuditLog).order_by(AuditLog.created_at).all()
        prev_hash = "INITIAL_BLOCK"
        
        for log in logs:
            if log.previous_hash != prev_hash:
                return False, log.id
            
            recalculated = log.calculate_hash(prev_hash)
            if log.log_hash != recalculated:
                return False, log.id
            
            prev_hash = log.log_hash
            
        return True, None

    def cleanup_old_logs(self, db: Session, days: int = 90):
        """
        Retention policy: Delete logs older than X days.
        """
        threshold = datetime.now(timezone.utc) - timedelta(days=days)
        deleted = db.query(AuditLog).filter(AuditLog.created_at < threshold).delete()
        db.commit()
        logger.warning(f"Audit retention cleanup: {deleted} logs deleted (older than {days} days)")
        return deleted

audit_service = AuditService()
