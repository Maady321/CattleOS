import logging
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.sync import SyncLog
from app.models.cattle import Cattle
from app.models.logs import HealthLog, Vaccination, Medicine, MilkLog, FeedLog, BreedingLog
from app.schemas.sync import SyncChange, SyncOperation, SyncPushRequest, SyncResponse

logger = logging.getLogger(__name__)

# Mapping entity types to their model classes
ENTITY_MODEL_MAP = {
    "cattle": Cattle,
    "health_log": HealthLog,
    "vaccination": Vaccination,
    "medicine": Medicine,
    "milk_log": MilkLog,
    "feed_log": FeedLog,
    "breeding_log": BreedingLog,
}

class SyncService:
    def record_change(
        self, 
        db: Session, 
        farm_id: UUID, 
        entity_type: str, 
        entity_id: UUID, 
        operation: str,
        version: int
    ):
        """Records a change in the SyncLog table."""
        sync_log = SyncLog(
            farm_id=farm_id,
            entity_type=entity_type,
            entity_id=entity_id,
            operation=operation,
            version=version
        )
        db.add(sync_log)
        db.flush()

    def get_latest_version(self, db: Session, farm_id: UUID) -> int:
        """Gets the highest version number for a farm's sync logs."""
        max_version = db.query(func.max(SyncLog.version)).filter(SyncLog.farm_id == farm_id).scalar()
        return max_version or 0

    def pull_changes(self, db: Session, farm_id: UUID, last_version: int) -> SyncResponse:
        """Retrieves all changes since last_version for a specific farm."""
        logs = db.query(SyncLog).filter(
            SyncLog.farm_id == farm_id,
            SyncLog.version > last_version
        ).order_by(SyncLog.version.asc()).all()

        changes = []
        for log in logs:
            model_class = ENTITY_MODEL_MAP.get(log.entity_type)
            data = None
            if log.operation != SyncOperation.DELETE and model_class:
                entity = db.query(model_class).get(log.entity_id)
                if entity:
                    # Convert sqlalchemy object to dict, handling UUIDs and Enums
                    data = {c.name: getattr(entity, c.name) for c in entity.__table__.columns}
            
            changes.append(SyncChange(
                id=log.entity_id,
                entity_type=log.entity_type,
                operation=SyncOperation(log.operation),
                data=data,
                version=log.version
            ))

        return SyncResponse(
            changes=changes,
            new_version=self.get_latest_version(db, farm_id),
            timestamp=datetime.utcnow()
        )

    def push_changes(self, db: Session, farm_id: UUID, push_req: SyncPushRequest) -> SyncResponse:
        """Applies changes from the client and returns the new state/version."""
        current_max_version = self.get_latest_version(db, farm_id)
        
        for change in push_req.changes:
            model_class = ENTITY_MODEL_MAP.get(change.entity_type)
            if not model_class:
                logger.error(f"Unknown entity type: {change.entity_type}")
                continue

            current_max_version += 1
            
            if change.operation == SyncOperation.INSERT:
                # Handle insert
                if change.data:
                    # Remove version/client_mutation_id if present to let server set them
                    change.data.pop('version', None)
                    obj_data = {**change.data, "id": change.id, "farm_id": farm_id, "version": current_max_version}
                    db_obj = model_class(**obj_data)
                    db.add(db_obj)
                    self.record_change(db, farm_id, change.entity_type, change.id, "INSERT", current_max_version)

            elif change.operation == SyncOperation.UPDATE:
                # Handle update
                db_obj = db.query(model_class).get(change.id)
                if db_obj:
                    for key, value in change.data.items():
                        if hasattr(db_obj, key) and key not in ['id', 'farm_id']:
                            setattr(db_obj, key, value)
                    db_obj.version = current_max_version
                    self.record_change(db, farm_id, change.entity_type, change.id, "UPDATE", current_max_version)

            elif change.operation == SyncOperation.DELETE:
                # Handle delete (soft delete preferred)
                db_obj = db.query(model_class).get(change.id)
                if db_obj:
                    if hasattr(db_obj, 'is_deleted'):
                        db_obj.is_deleted = True
                        db_obj.version = current_max_version
                        self.record_change(db, farm_id, change.entity_type, change.id, "DELETE", current_max_version)
                    else:
                        db.delete(db_obj)
                        self.record_change(db, farm_id, change.entity_type, change.id, "DELETE", current_max_version)

        db.commit()
        # Return empty changes for now, or the latest version
        return SyncResponse(
            changes=[],
            new_version=current_max_version,
            timestamp=datetime.utcnow()
        )

sync_service = SyncService()
