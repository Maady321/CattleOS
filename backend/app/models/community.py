import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Float, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base, TimestampMixin

class GroupType(str, enum.Enum):
    VILLAGE = "VILLAGE"
    COOPERATIVE = "COOPERATIVE"
    EXPERT_QA = "EXPERT_QA"

class CommunityGroup(Base, TimestampMixin):
    __tablename__ = "community_groups"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, index=True)
    group_type = Column(SQLEnum(GroupType), nullable=False)
    region = Column(String, index=True) # e.g. Wayanad, Palakkad
    
    member_count = Column(Integer, default=0)

class CommunityPost(Base, TimestampMixin):
    __tablename__ = "community_posts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("community_groups.id"), index=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    content = Column(Text)
    language = Column(String, default="ml")
    
    is_alert = Column(Boolean, default=False) # Disease/Weather Alert
    upvotes = Column(Integer, default=0)
    
    is_moderated = Column(Boolean, default=False)

class FarmerReputation(Base, TimestampMixin):
    __tablename__ = "community_reputation"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, index=True)
    
    trust_score = Column(Integer, default=50) # 0-100
    referral_count = Column(Integer, default=0)
    is_ambassador = Column(Boolean, default=False)
    
    badges = Column(JSON, default=[]) # ['Pioneer', 'Expert']
    last_rank = Column(Integer) # Leaderboard position
