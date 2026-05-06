import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base, TimestampMixin

class VoiceFeedback(Base, TimestampMixin):
    """
    Stores human feedback on voice transcriptions for model evaluation.
    """
    __tablename__ = "voice_feedback"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    transcript = Column(Text)
    corrected_text = Column(Text, nullable=True) # What the user actually meant
    
    confidence_score = Column(Float)
    is_correct = Column(Boolean) # True = Confirmed, False = Corrected
    
    domain = Column(String) # MILK, MEDICINE, etc.
    metadata_json = Column(JSON, default={}) # Device, dialect info
