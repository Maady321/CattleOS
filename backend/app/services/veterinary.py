import logging
from typing import Optional, Dict, Any, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.health import Vet, Consultation, ConsultationStatus, Prescription, VaccinationRecord
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class VeterinaryService:
    def __init__(self, db: Session):
        self.db = db

    def book_consultation(self, farm_id: UUID, cattle_id: UUID, vet_id: UUID, symptoms: str, is_emergency: bool = False) -> Consultation:
        consult = Consultation(
            farm_id=farm_id,
            cattle_id=cattle_id,
            vet_id=vet_id,
            symptoms=symptoms,
            is_emergency=is_emergency,
            status=ConsultationStatus.REQUESTED
        )
        self.db.add(consult)
        self.db.commit()
        
        if is_emergency:
            # Trigger emergency alert to Vet (Mock)
            logger.warning(f"EMERGENCY Consultation created for Vet {vet_id}")
            
        return consult

    def issue_prescription(self, consultation_id: UUID, medicines: List[Dict[str, Any]], instructions: str) -> Prescription:
        prescription = Prescription(
            consultation_id=consultation_id,
            medicines=medicines,
            instructions=instructions,
            valid_until=datetime.utcnow() + timedelta(days=30)
        )
        self.db.add(prescription)
        self.db.commit()
        return prescription

    def schedule_vaccination(self, cattle_id: UUID, vaccine_name: str, dose_date: datetime):
        record = VaccinationRecord(
            cattle_id=cattle_id,
            vaccine_name=vaccine_name,
            administered_at=dose_date,
            next_dose_at=dose_date + timedelta(days=180) # Default 6 months
        )
        self.db.add(record)
        self.db.commit()
        return record

    def get_nearby_vets(self, lat: float, lng: float) -> List[Vet]:
        """
        Simple geo-discovery (In production, use PostGIS).
        """
        return self.db.query(Vet).filter(Vet.is_verified == True).all()
