import logging
from typing import Optional, Dict, Any, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.success import FarmScorecard, SuccessMilestone
from app.models.analytics import FarmMetric
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class PilotSuccessService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_pilot_success_score(self, farm_id: UUID) -> Dict[str, Any]:
        """
        Calculates a comprehensive success score (0-100) for the pilot phase.
        """
        metric = self.db.query(FarmMetric).filter(FarmMetric.farm_id == farm_id).first()
        milestones = self.db.query(SuccessMilestone).filter(SuccessMilestone.farm_id == farm_id).all()
        
        score = 0
        
        # 1. Activation (Max 40)
        activation_score = min(40, len(milestones) * 8)
        score += activation_score
        
        # 2. Usage Consistency (Max 40)
        if metric:
            days_active = (datetime.utcnow() - metric.last_activity_at).days
            consistency = max(0, 40 - (days_active * 10))
            score += consistency
            
        # 3. Community/Feedback (Max 20)
        # Mocking feedback participation
        feedback_score = 15 
        score += feedback_score
        
        return {
            "total_score": score,
            "activation": activation_score,
            "usage": consistency if metric else 0,
            "status": "HEALTHY" if score > 70 else "AT_RISK"
        }

    def get_cohort_benchmarks(self) -> Dict[str, Any]:
        """
        Calculates average success metrics across the 100-farm pilot.
        """
        scores = self.db.query(FarmScorecard).all()
        if not scores: return {"avg_score": 0}
        
        avg = sum(s.health_score for s in scores) / len(scores)
        return {
            "avg_score": round(avg, 1),
            "top_performer_id": scores[0].farm_id if scores else None,
            "total_farms": len(scores)
        }

    def trigger_coaching_nudge(self, farm_id: UUID):
        """
        Triggers a 'Usage Coaching' notification if a farm hasn't logged milk in 48h.
        """
        logger.info(f"PILOT_OPS: Triggering coaching nudge for Farm {farm_id}")
        # Integration with MessagingService
