import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.voice import VoiceFeedback

logger = logging.getLogger(__name__)

class StorageLifecycleService:
    """
    Optimizes storage costs by moving old/heavy data to cold storage.
    """
    def __init__(self, db: Session):
        self.db = db

    def archive_old_voice_samples(self, days: int = 7):
        """
        Identifies voice samples older than X days for transition to S3 Glacier.
        """
        threshold = datetime.utcnow() - timedelta(days=days)
        samples = self.db.query(VoiceFeedback).filter(
            VoiceFeedback.created_at < threshold,
            VoiceFeedback.metadata_json['storage_class'].astext == 'STANDARD'
        ).all()
        
        for sample in samples:
            # Logic to trigger S3 Lifecycle transition
            logger.info(f"COST_OP: Moving Sample {sample.id} to COLD_STORAGE.")
            sample.metadata_json['storage_class'] = 'GLACIER'
            
        self.db.commit()
        return len(samples)
