from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.community import CommunityGroup, CommunityPost, FarmerReputation
from app.schemas.community import (
    GroupResponse, 
    PostResponse, 
    PostCreate, 
    LeaderboardEntry
)
from app.services.community import CommunityService
from uuid import UUID

router = APIRouter()

@router.get("/groups", response_model=List[GroupResponse])
def list_groups(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    return db.query(CommunityGroup).all()

@router.get("/groups/{group_id}/posts", response_model=List[PostResponse])
def list_group_posts(
    group_id: UUID,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    return db.query(CommunityPost).filter(
        CommunityPost.group_id == group_id,
        CommunityPost.is_moderated == True
    ).order_by(CommunityPost.created_at.desc()).all()

@router.post("/posts", response_model=PostResponse)
def create_post(
    post_in: PostCreate,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    service = CommunityService(db)
    return service.create_post(
        user_id=current_user.id,
        group_id=post_in.group_id,
        content=post_in.content,
        is_alert=post_in.is_alert
    )

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_community_leaderboard(
    db: Session = Depends(deps.get_db)
) -> Any:
    service = CommunityService(db)
    return service.get_leaderboard()

@router.get("/reputation/me", response_model=Dict[str, Any])
def get_my_reputation(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    rep = db.query(FarmerReputation).filter(FarmerReputation.user_id == current_user.id).first()
    if not rep:
        return {"trust_score": 50, "badges": [], "is_ambassador": False}
    return {
        "trust_score": rep.trust_score,
        "badges": rep.badges,
        "is_ambassador": rep.is_ambassador,
        "referral_count": rep.referral_count
    }
