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
    
    # Shortcuts for common quantities
    SHORTCUTS = {
        "അഞ്ച്": 5, "അഞ്ചു": 5, "five": 5,
        "പത്ത്": 10, "പത്തു": 10, "ten": 10,
    }

    def parse_transcript(self, transcript: str) -> Dict[str, Any]:
        """
        Parses the transcript with confidence scoring.
        """
        transcript = transcript.lower()
        confidence = 1.0 # Default
        
        # 1. Check Shortcuts
        for s_word, val in self.SHORTCUTS.items():
            if s_word in transcript:
                return self._parse_milk(f"{val} liter", confidence=0.95)

        # 2. Domain Detection & Score Adjustment
        if any(w in transcript for w in ["ലിറ്റർ", "liter"]):
            result = self._parse_milk(transcript, confidence=0.9)
        elif any(w in transcript for w in ["മരുന്ന്", "medicine"]):
            result = self._parse_medicine(transcript, confidence=0.8)
        else:
            result = {"type": "UNKNOWN", "raw": transcript, "confidence": 0.3}

        # Threshold Logic for UI
        result["needs_confirmation"] = result.get("confidence", 0) < 0.9
        return result

    def _parse_milk(self, text: str, confidence: float = 1.0) -> Dict[str, Any]:
        qty_match = re.search(r"(\d+(\.\d+)?)", text)
        qty = float(qty_match.group(1)) if qty_match else 0
        session = "Morning" if any(w in text for w in ["രാവിലെ", "morning"]) else "Evening"
        
        return {
            "type": "MILK_LOG",
            "confidence": confidence,
            "data": {
                "quantity_liters": qty,
                "session": session
            },
            "confirmation_text": f"{qty} ലിറ്റർ പാൽ {('രാവിലെ' if session == 'Morning' else 'വൈകുന്നേരം')} രേഖപ്പെടുത്തട്ടെ?"
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
