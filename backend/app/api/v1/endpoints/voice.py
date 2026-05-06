from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.services.voice_nlu import MalayalamVoiceProcessor
from pydantic import BaseModel

router = APIRouter()

class VoiceInput(BaseModel):
    transcript: str
    language: str = "ml-IN"

class VoiceActionResponse(BaseModel):
    type: str
    data: dict
    confirmation_text: str

@router.post("/process", response_model=VoiceActionResponse)
def process_voice_command(
    voice_in: VoiceInput,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
) -> Any:
    """
    Processes a transcribed voice command and returns a structured action.
    """
    processor = MalayalamVoiceProcessor()
    result = processor.parse_transcript(voice_in.transcript)
    return result
