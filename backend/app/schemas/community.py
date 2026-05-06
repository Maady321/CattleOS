from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class GroupResponse(BaseModel):
    id: UUID
    name: str
    group_type: str
    member_count: int
    
    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    group_id: UUID
    content: str
    is_alert: bool = False

class PostResponse(BaseModel):
    id: UUID
    author_id: UUID
    content: str
    is_alert: bool
    upvotes: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    user_id: UUID
    score: int
    badges: List[str]
