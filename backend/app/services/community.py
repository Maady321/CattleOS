import logging
from typing import Optional, Dict, Any, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.community import CommunityPost, FarmerReputation, CommunityGroup
from datetime import datetime

logger = logging.getLogger(__name__)

class CommunityService:
    def __init__(self, db: Session):
        self.db = db

    def create_post(self, user_id: UUID, group_id: UUID, content: str, is_alert: bool = False) -> CommunityPost:
        # Simple moderation: check for profanity (Mock)
        is_moderated = "badword" not in content.lower()
        
        post = CommunityPost(
            author_id=user_id,
            group_id=group_id,
            content=content,
            is_alert=is_alert,
            is_moderated=is_moderated
        )
        self.db.add(post)
        
        # Reward trust score for posting
        self.update_trust_score(user_id, 2)
        
        self.db.commit()
        return post

    def update_trust_score(self, user_id: UUID, delta: int):
        rep = self.db.query(FarmerReputation).filter(FarmerReputation.user_id == user_id).first()
        if not rep:
            rep = FarmerReputation(user_id=user_id)
            self.db.add(rep)
        
        rep.trust_score = max(0, min(100, rep.trust_score + delta))
        
        # Check for Ambassador status
        if rep.referral_count >= 10:
            rep.is_ambassador = True
            if "Ambassador" not in rep.badges:
                rep.badges = list(rep.badges) + ["Ambassador"]
        
        self.db.commit()

    def get_local_alerts(self, region: str) -> List[CommunityPost]:
        """
        Returns high-priority disease/weather alerts for a region.
        """
        return self.db.query(CommunityPost).join(CommunityGroup).filter(
            CommunityGroup.region == region,
            CommunityPost.is_alert == True
        ).order_by(CommunityPost.created_at.desc()).limit(5).all()

    def get_leaderboard(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Returns the top trusted farmers globally.
        """
        reps = self.db.query(FarmerReputation).order_by(FarmerReputation.trust_score.desc()).limit(limit).all()
        return [
            {"user_id": r.user_id, "score": r.trust_score, "badges": r.badges}
            for r in reps
        ]
