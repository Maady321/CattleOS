import re
import logging
from typing import Dict, Any, Optional, List
from uuid import UUID
from datetime import datetime

logger = logging.getLogger(__name__)

class MalayalamVoiceProcessor:
    """
    NLU Processor for Malayalam Voice Commands in CattleOS.
    Handles dialects and maps phrases to structured data.
    """
    
    # Patterns for Milk Log: "raavile randu liter" (Morning 2 liters)
    MILK_PATTERNS = [
        r"(?P<qty>\d+(\.\d+)?)\s*(ലിറ്റർ|ലിറ്റര്|liter)",
        r"(?P<session>രാവിലെ|വൈകുന്നേരം|morning|evening)"
    ]
    
    # Patterns for Medicine: "pannikku paracetamol koduthu" (Gave paracetamol for fever)
    MED_PATTERNS = [
        r"(?P<med>[a-zA-Z\u0d00-\u0d7f]+)\s*(കൊടുത്തു|നൽകി|gave)",
    ]

    def parse_transcript(self, transcript: str) -> Dict[str, Any]:
        """
        Parses the Malayalam/English transcript into a structured command.
        """
        transcript = transcript.lower()
        logger.info(f"Processing transcript: {transcript}")

        # 1. Detect Domain
        if any(w in transcript for w in ["ലിറ്റർ", "liter", "പാൽ", "milk"]):
            return self._parse_milk(transcript)
        elif any(w in transcript for w in ["മരുന്ന്", "medicine", "ഗുളിക"]):
            return self._parse_medicine(transcript)
        elif any(w in transcript for w in ["ഓർമ്മിപ്പിക്കുക", "remind", "അലർട്ട്"]):
            return self._parse_reminder(transcript)
        
        return {"type": "UNKNOWN", "raw": transcript}

    def _parse_milk(self, text: str) -> Dict[str, Any]:
        qty = re.search(r"(\d+(\.\d+)?)", text)
        session = "Morning" if any(w in text for w in ["രാവിലെ", "morning"]) else "Evening"
        
        return {
            "type": "MILK_LOG",
            "data": {
                "quantity_liters": float(qty.group(1)) if qty else 0,
                "session": session
            },
            "confirmation_text": f"{qty.group(1) if qty else '0'} ലിറ്റർ പാൽ {session === 'Morning' ? 'രാവിലെ' : 'വൈകുന്നേരം'} രേഖപ്പെടുത്തട്ടെ?"
        }

    def _parse_medicine(self, text: str) -> Dict[str, Any]:
        # Simple extraction logic
        return {
            "type": "MEDICINE_LOG",
            "data": {"notes": text},
            "confirmation_text": "മരുന്ന് വിവരം രേഖപ്പെടുത്തട്ടെ?"
        }

    def _parse_reminder(self, text: str) -> Dict[str, Any]:
        return {
            "type": "REMINDER",
            "data": {"text": text},
            "confirmation_text": "ഓർമ്മപ്പെടുത്തൽ സെറ്റ് ചെയ്യട്ടെ?"
        }
