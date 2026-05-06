import logging
from typing import Optional, Dict, Any, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.subsidy import SubsidyScheme, SubsidyApplication, SubsidyStatus, ComplianceRecord
from app.models.farm import Farm
from app.models.cattle import Cattle
from datetime import datetime

logger = logging.getLogger(__name__)

class SubsidyService:
    def __init__(self, db: Session):
        self.db = db

    def check_eligibility(self, farm_id: UUID, scheme_id: UUID) -> Dict[str, Any]:
        """
        Runs the eligibility engine for a specific farm and scheme.
        """
        farm = self.db.query(Farm).get(farm_id)
        scheme = self.db.query(SubsidyScheme).get(scheme_id)
        
        if not scheme: return {"eligible": False, "reason": "Scheme not found"}
        
        cattle_count = self.db.query(Cattle).filter(Cattle.farm_id == farm_id).count()
        criteria = scheme.eligibility_criteria
        
        reasons = []
        is_eligible = True
        
        if cattle_count < criteria.get("min_cattle", 0):
            is_eligible = False
            reasons.append(f"Minimum cattle required: {criteria['min_cattle']}")
            
        # Additional logic for SC/ST, location etc.
        
        return {
            "eligible": is_eligible,
            "reasons": reasons,
            "current_cattle_count": cattle_count
        }

    def auto_fill_application(self, farm_id: UUID, scheme_id: UUID) -> Dict[str, Any]:
        """
        Auto-fills the government form using existing farm data.
        """
        farm = self.db.query(Farm).get(farm_id)
        owner = farm.owner # Assuming relationship
        
        return {
            "applicant_name": owner.full_name if owner else "Unknown",
            "farm_name": farm.name,
            "farm_address": "Mock Address from Farm metadata",
            "bank_account": "Verified Bank Account on file",
            "cattle_count": self.db.query(Cattle).filter(Cattle.farm_id == farm_id).count()
        }

    def submit_application(self, application_id: UUID):
        """
        Handles the submission workflow, generating an audit trail and govt tracking ID.
        """
        app = self.db.query(SubsidyApplication).get(application_id)
        if not app: return
        
        app.status = SubsidyStatus.SUBMITTED
        app.submission_date = datetime.utcnow()
        app.reference_number = f"GOV-{datetime.now().strftime('%Y%m%d')}-{app.id.hex[:6].upper()}"
        
        self.db.commit()
        return app

    def seed_schemes(self):
        """
        Pre-populates popular Indian dairy subsidy schemes.
        """
        schemes = [
            {
                "name": "DEDS (Dairy Entrepreneurship Development Scheme)",
                "department": "NABARD",
                "eligibility_criteria": {"min_cattle": 2, "max_cattle": 10},
                "required_documents": ["Aadhaar", "Land Records", "Cattle Health Certificate"]
            },
            {
                "name": "NPDD (National Programme for Dairy Development)",
                "department": "DAHD",
                "eligibility_criteria": {"min_cattle": 1},
                "required_documents": ["Cooperative Membership", "Milk Pouring Records"]
            }
        ]
        
        for s in schemes:
            existing = self.db.query(SubsidyScheme).filter(SubsidyScheme.name == s["name"]).first()
            if not existing:
                self.db.add(SubsidyScheme(**s))
        self.db.commit()
