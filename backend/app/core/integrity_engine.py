import statistics
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.logs import MilkLog, FeedLog, BreedingLog, FinancialRecord, WorkflowEvent
from app.models.integrity import DataAnomaly, IntegrityCheck, CalculationFormula, DataCorrection
from app.models.audit_log import AuditLog

class IntegrityEngine:
    def __init__(self, db: Session):
        self.db = db

    def detect_duplicates(self, farm_id: UUID, model: Any, threshold_minutes: int = 5) -> List[DataAnomaly]:
        """
        Detects potential duplicate entries based on time proximity and identical data.
        """
        # Logic: Find records of the same model for the same farm created within minutes of each other
        # This is a simplified version; production would use hash-based matching.
        anomalies = []
        # Implementation details omitted for brevity in this scratch, but logic would query recent records
        return anomalies

    def detect_outliers(self, farm_id: UUID, model: Any, field: str, z_threshold: float = 3.0) -> List[DataAnomaly]:
        """
        Statistical outlier detection using Z-score.
        """
        records = self.db.query(model).filter(model.farm_id == farm_id).all()
        if len(records) < 5:
            return []
            
        values = [getattr(r, field) for r in records if getattr(r, field) is not None]
        if not values:
            return []
            
        mean = statistics.mean(values)
        stdev = statistics.stdev(values) if len(values) > 1 else 0
        
        anomalies = []
        if stdev == 0:
            return []
            
        for r in records:
            val = getattr(r, field)
            if val is not None:
                z_score = abs((val - mean) / stdev)
                if z_score > z_threshold:
                    anomaly = DataAnomaly(
                        farm_id=farm_id,
                        resource_type=model.__tablename__,
                        resource_id=r.id,
                        anomaly_type="OUTLIER",
                        severity="MEDIUM",
                        description=f"Outlier detected in {field}: {val} (Z-score: {z_score:.2f})"
                    )
                    anomalies.append(anomaly)
        return anomalies

    def check_consistency(self, farm_id: UUID) -> List[DataAnomaly]:
        """
        Cross-domain consistency checks.
        Example: Breeding event 'Calving' should result in a new Cattle record or a change in status.
        """
        anomalies = []
        # 1. Breeding consistency: Calving events vs Cattle births
        # 2. Feed consistency: Total feed cost vs Financial records
        # 3. Milk consistency: Milk production vs Sales records
        return anomalies

    def detect_missing_data(self, farm_id: UUID, days: int = 30) -> List[DataAnomaly]:
        """
        Detects gaps in daily logging (e.g., missing milk logs for a day).
        """
        anomalies = []
        # Implementation: Check every date in range for at least one log
        return anomalies

    def run_reconciliation(self, farm_id: UUID, start_date: datetime, end_date: datetime) -> IntegrityCheck:
        """
        Full reconciliation job.
        """
        check = IntegrityCheck(
            farm_id=farm_id,
            check_type="RECONCILIATION",
            started_at=datetime.utcnow(),
            status="RUNNING"
        )
        self.db.add(check)
        self.db.commit()
        
        results = {
            "outliers": len(self.detect_outliers(farm_id, MilkLog, "quantity_liters")),
            "duplicates": len(self.detect_duplicates(farm_id, MilkLog)),
            "consistency_issues": len(self.check_consistency(farm_id)),
            "missing_data_gaps": len(self.detect_missing_data(farm_id))
        }
        
        check.status = "FAILED" if any(results.values()) else "PASSED"
        check.results_json = results
        check.completed_at = datetime.utcnow()
        self.db.commit()
        return check

    def calculate_deterministic_metric(self, farm_id: UUID, formula_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates a metric using a versioned formula with full provenance.
        """
        formula = self.db.query(CalculationFormula).filter(
            CalculationFormula.name == formula_name,
            CalculationFormula.is_active == True
        ).order_by(CalculationFormula.version.desc()).first()
        
        if not formula:
            raise ValueError(f"Formula {formula_name} not found")
            
        # Provenance: we record exactly which formula version and data snapshots were used.
        # In a real system, this would store hashes of the input data too.
        result_data = self._execute_formula(formula, params)
        
        return {
            "result": result_data,
            "formula_version": formula.version,
            "calculated_at": datetime.utcnow().isoformat(),
            "provenance_id": str(UUID(int=0)) # Placeholder for a unique calc ID
        }

    def _execute_formula(self, formula: CalculationFormula, params: Dict[str, Any]) -> Any:
        # Secure sandbox execution or simple DSL evaluator
        # For now, a placeholder logic
        return 0.0

    def apply_correction(self, correction_id: UUID, approver_id: UUID) -> bool:
        """
        Executes a correction workflow.
        Instead of modifying the original immutable record, it creates an 'offset' or 'reversal' record.
        """
        correction = self.db.query(DataCorrection).get(correction_id)
        if not correction or correction.status != "PENDING":
            return False
            
        # 1. Update correction status
        correction.status = "APPROVED"
        
        # 2. Create the offsetting event based on resource type
        # ... logic to insert a new row with negative values or corrected data ...
        
        # 3. Create Audit Trail
        audit = AuditLog(
            event_type="DATA_CORRECTION",
            action="UPDATE",
            user_id=approver_id,
            farm_id=correction.farm_id,
            resource_type=correction.resource_type,
            resource_id=str(correction.resource_id),
            metadata_json={
                "correction_id": str(correction.id),
                "reason": correction.reason
            }
        )
        self.db.add(audit)
        self.db.commit()
        return True
