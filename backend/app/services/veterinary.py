import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.veterinary import Consultation, ConsultationType, ConsultationStatus, Prescription, VetProfile
from app.models.logs import HealthLog

logger = logging.getLogger(__name__)

class VeterinaryService:
    def __init__(self, db: Session):
        self.db = db

    def book_consultation(self, farm_id: UUID, vet_id: UUID, cattle_id: UUID, sched_at: datetime, c_type: ConsultationType) -> Consultation:
        """
        Books a veterinary consultation.
        """
        consultation = Consultation(
            farm_id=farm_id,
            vet_id=vet_id,
            cattle_id=cattle_id,
            scheduled_at=sched_at,
            type=c_type,
            status=ConsultationStatus.SCHEDULED
        )
        
        if c_type == ConsultationType.TELECONSULT:
            consultation.meeting_url = f"https://meet.cattleos.com/{UUID(int=0)}" # Mock URL
            
        self.db.add(consultation)
        self.db.commit()
        return consultation

    def trigger_emergency_consult(self, farm_id: UUID, cattle_id: UUID, symptoms: str) -> Consultation:
        """
        Emergency flow: Assigns first available verified vet.
        """
        # Find verified vet (simplified logic)
        vet = self.db.query(VetProfile).filter(VetProfile.is_verified == True).first()
        if not vet:
            raise ValueError("No emergency vets available")
            
        consultation = Consultation(
            farm_id=farm_id,
            vet_id=vet.id,
            cattle_id=cattle_id,
            type=ConsultationType.EMERGENCY,
            status=ConsultationStatus.IN_PROGRESS,
            scheduled_at=datetime.utcnow(),
            started_at=datetime.utcnow(),
            symptoms=symptoms
        )
        self.db.add(consultation)
        self.db.commit()
        return consultation

    def complete_consultation(self, consultation_id: UUID, diagnosis: str, medicines: List[Dict[str, Any]]):
        """
        Finishes consultation, creates prescription, and updates health log.
        """
        consultation = self.db.query(Consultation).get(consultation_id)
        if not consultation: return
        
        consultation.status = ConsultationStatus.COMPLETED
        consultation.diagnosis = diagnosis
        consultation.ended_at = datetime.utcnow()
        
        # 1. Create Prescription
        prescription = Prescription(
            consultation_id=consultation.id,
            cattle_id=consultation.cattle_id,
            medicines_json=medicines,
            instructions="As discussed in consultation"
        )
        self.db.add(prescription)
        
        # 2. Add to Cattle Health Log
        health_log = HealthLog(
            farm_id=consultation.farm_id,
            cattle_id=consultation.cattle_id,
            description=f"Vet Consultation: {diagnosis}",
            diagnosis=diagnosis
        )
        self.db.add(health_log)
        
        self.db.commit()
        return prescription
