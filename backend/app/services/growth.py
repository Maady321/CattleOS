import logging
from typing import Optional, Dict, Any, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.growth import PMFSurvey, PMFResponse, Referral, FeatureRequest

logger = logging.getLogger(__name__)

class GrowthService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_pmf_score(self) -> Dict[str, Any]:
        """
        Calculates the PMF score (Sean Ellis Test).
        """
        total = self.db.query(PMFSurvey).count()
        if total == 0: return {"score": 0, "status": "NO_DATA"}
        
        very_disappointed = self.db.query(PMFSurvey).filter(
            PMFSurvey.response == PMFResponse.VERY_DISAPPOINTED
        ).count()
        
        score = (very_disappointed / total) * 100
        return {
            "score": round(score, 1),
            "total_responses": total,
            "is_pmf_achieved": score >= 40
        }

    def generate_referral(self, farm_id: UUID, target_email: str) -> str:
        code = f"CO-{str(uuid.uuid4())[:8].upper()}"
        referral = Referral(
            referrer_farm_id=farm_id,
            referred_email=target_email,
            referral_code=code
        )
        self.db.add(referral)
        self.db.commit()
        return code

    def process_referral_signup(self, code: str, new_farm_id: UUID):
        referral = self.db.query(Referral).filter(Referral.referral_code == code).first()
        if referral:
            referral.status = "SIGNED_UP"
            self.db.commit()
            # Logic to grant rewards to referrer
            return True
        return False

    def get_feature_demand(self) -> List[Dict[str, Any]]:
        """
        Lists features sorted by votes (Demand Scoring).
        """
        requests = self.db.query(FeatureRequest).order_by(FeatureRequest.votes.desc()).limit(10).all()
        return [
            {"title": r.title, "votes": r.votes, "status": r.status}
            for r in requests
        ]
