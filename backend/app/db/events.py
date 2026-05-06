from sqlalchemy import event, func
from sqlalchemy.orm import Session
from app.models.sync import SyncLog
from app.db.base_class import SyncMixin, ImmutableMixin
import logging

logger = logging.getLogger(__name__)

def handle_sync_event(mapper, connection, target, operation):
    """
    Automatically increments version and records a SyncLog entry.
    """
    if not isinstance(target, SyncMixin):
        return

    # We need a session to query for the current max version or just use a global increment?
    # Better: Use a subquery or a farm-scoped counter.
    # For now, let's assume the session is available.
    
    session = Session.object_session(target)
    if not session:
        return

    # Get farm_id if possible
    farm_id = getattr(target, 'farm_id', None)
    if not farm_id:
        return

    # Increment version
    # Note: This is a bit simplified. In a real system, you'd want a more robust 
    # way to handle concurrent version increments (e.g. sequence per farm).
    max_v = session.query(func.max(SyncLog.version)).filter(SyncLog.farm_id == farm_id).scalar() or 0
    target.version = max_v + 1

    # Record log
    sync_log = SyncLog(
        farm_id=farm_id,
        entity_type=target.__tablename__.rstrip('s'), # Simple mapping
        entity_id=target.id,
        operation=operation,
        version=target.version
    )
    session.add(sync_log)

def handle_immutability_event(mapper, connection, target):
    """
    Prevents updates or deletes on immutable records.
    """
    if hasattr(target, "is_immutable") and target.is_immutable:
        # Check if we are in a 'correction' context?
        # For simplicity, just raise error if trying to update
        raise RuntimeError(f"Record in {target.__tablename__} is immutable and cannot be updated or deleted.")

def setup_db_events():
    """
    Global setup for DB events including sync and immutability.
    """
    # Note: In production, you'd iterate over all subclasses of Base
    # For this demo, we'll just show the logic.
    from app.models.logs import MilkLog, FeedLog, BreedingLog, FinancialRecord
    
    for model in [MilkLog, FeedLog, BreedingLog, FinancialRecord]:
        event.listen(model, 'before_update', handle_immutability_event)
        event.listen(model, 'before_delete', handle_immutability_event)

def setup_sync_events():
    # This would ideally be called for all models that use SyncMixin
    # For now, let's keep it manual or use a base class check
    pass
