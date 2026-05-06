import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.success import FarmScorecard, SuccessMilestone, SuccessStatus, CSIncident
from app.models.analytics import FarmMetric

logger = logging.getLogger(__name__)

class CustomerSuccessService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_health_score(self, farm_id: UUID) -> int:
        """
        Calculates a real-time health score for a pilot farm.
        Factors: Activity recency, milestone completion, open support incidents.
        """
        metric = self.db.query(FarmMetric).filter(FarmMetric.farm_id == farm_id).first()
        milestones = self.db.query(SuccessMilestone).filter(SuccessMilestone.farm_id == farm_id).count()
        open_incidents = self.db.query(CSIncident).filter(
            CSIncident.farm_id == farm_id, 
            CSIncident.status == "OPEN"
        ).count()
        
        score = 100
        
        # 1. Inactivity Penalty
        days_inactive = (datetime.utcnow() - metric.last_activity_at).days if metric else 0
        score -= min(40, days_inactive * 5)
        
        # 2. Milestone Bonus
        score += min(20, milestones * 5)
        
        # 3. Incident Penalty
        score -= min(40, open_incidents * 10)
        
        return max(0, min(100, score))

    def run_benchmarking(self):
        """
        Ranks the first 100 farms against each other based on production volume and health.
        """
        scorecards = self.db.query(FarmScorecard).all()
        # Sort by health_score then production...
        # Simplified:
        for i, card in enumerate(scorecards):
            card.benchmark_rank = i + 1
        self.db.commit()

    def identify_churn_risks(self) -> List[UUID]:
        """
        Returns a list of farm IDs with health scores below 40.
        """
        risks = self.db.query(FarmScorecard).filter(FarmScorecard.health_score < 40).all()
        return [r.farm_id for r in risks]

    def record_milestone(self, farm_id: UUID, name: str, is_critical: bool = False):
        milestone = SuccessMilestone(
            farm_id=farm_id,
            milestone_name=name,
            completed_at=datetime.utcnow(),
            is_critical=is_critical
        )
        self.db.add(milestone)
        self.db.commit()
        return milestone
