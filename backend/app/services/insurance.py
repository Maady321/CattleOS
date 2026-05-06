import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.insurance import InsurancePolicy, InsuranceClaim, ClaimStatus, PolicyStatus
from app.models.cattle import Cattle

logger = logging.getLogger(__name__)

class InsuranceService:
    def __init__(self, db: Session):
        self.db = db

    def file_claim(self, policy_id: UUID, claim_type: str, incident_date: datetime, docs: List[str]) -> InsuranceClaim:
        """
        Files a new insurance claim with automated fraud detection checks.
        """
        policy = self.db.query(InsurancePolicy).get(policy_id)
        if not policy: raise ValueError("Policy not found")

        claim = InsuranceClaim(
            policy_id=policy.id,
            farm_id=policy.farm_id,
            claim_type=claim_type,
            incident_date=incident_date,
            claimed_amount=policy.sum_assured,
            documents_json=docs,
            status=ClaimStatus.SUBMITTED
        )

        # 1. Basic Fraud Detection Logic
        self._run_fraud_checks(claim, policy)
        
        self.db.add(claim)
        self.db.commit()
        return claim

    def _run_fraud_checks(self, claim: InsuranceClaim, policy: InsurancePolicy):
        flags = []
        
        # Check if policy was created very recently (< 15 days)
        if (claim.incident_date - policy.start_date).days < 15:
            flags.append("EARLY_CLAIM_SUSPICION")
            
        # Check if incident date is in the future
        if claim.incident_date > datetime.utcnow():
            flags.append("FUTURE_INCIDENT_DATE")
            
        if flags:
            claim.is_suspicious = True
            claim.fraud_flags = flags
            logger.warning(f"Suspicious claim detected: {claim.id} - Flags: {flags}")

    def report_cattle_death(self, cattle_id: UUID, death_date: datetime, reason: str):
        """
        Integrated flow: When a cow dies, automatically trigger the insurance claim process.
        """
        policy = self.db.query(InsurancePolicy).filter(
            InsurancePolicy.cattle_id == cattle_id,
            InsurancePolicy.status == PolicyStatus.ACTIVE
        ).first()
        
        if policy:
            self.file_claim(
                policy_id=policy.id,
                claim_type="DEATH",
                incident_date=death_date,
                docs=[] # Farmer will upload later
            )
            return True
        return False

    def get_renewal_status(self, farm_id: UUID) -> List[Dict[str, Any]]:
        """
        Identifies policies expiring in the next 30 days.
        """
        deadline = datetime.utcnow() + timedelta(days=30)
        expiring = self.db.query(InsurancePolicy).filter(
            InsurancePolicy.farm_id == farm_id,
            InsurancePolicy.expiry_date <= deadline,
            InsurancePolicy.status == PolicyStatus.ACTIVE
        ).all()
        
        return [
            {"cattle_id": str(p.cattle_id), "policy_no": p.policy_number, "expiry": p.expiry_date}
            for p in expiring
        ]
