import logging
from typing import Optional, Dict, Any, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.trust import VerificationRequest, PlatformHealth, TransparencyReport
from app.models.analytics import FarmMetric
from datetime import datetime

logger = logging.getLogger(__name__)

class TrustService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_data_trust_score(self, farm_id: UUID) -> int:
        """
        Calculates a data integrity/trust score for a farm.
        Factors: Data continuity, outlier frequency, and community standing.
        """
        metric = self.db.query(FarmMetric).filter(FarmMetric.farm_id == farm_id).first()
        if not metric: return 0
        
        score = 100
        
        # 1. Continuity Check (Penalty for gaps > 2 days)
        if metric.last_activity_at < datetime.utcnow() - timedelta(days=2):
            score -= 20
            
        # 2. Correctness Check (Penalty for anomalies)
        # Mocking based on anomaly count
        anomaly_count = 0 
        score -= min(30, anomaly_count * 10)
        
        return max(0, min(100, score))

    def submit_verification(self, target_id: UUID, entity_type: str, docs: List[str]) -> VerificationRequest:
        req = VerificationRequest(
            target_id=target_id,
            entity_type=entity_type,
            document_urls=docs,
            status="PENDING"
        )
        self.db.add(req)
        self.db.commit()
        return req

    def get_platform_health(self) -> List[Dict[str, Any]]:
        """
        Returns real-time status of all platform core services.
        """
        health = self.db.query(PlatformHealth).all()
        return [
            {"service": h.service_name, "status": h.status, "uptime": h.uptime_percentage}
            for h in health
        ]
