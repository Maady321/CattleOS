from typing import List, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.farm import Farm
from app.models.cattle import Cattle, CattleGender, CattleStatus
from app.models.logs import MilkLog, HealthLog
from app.models.operations import FarmOnboarding, UsageMetric
from datetime import datetime, date, timedelta
import random

class ProvisioningService:
    def __init__(self, db: Session):
        self.db = db

    def provision_pilot_farm(self, farm_name: str, owner_id: UUID) -> Farm:
        """
        Provision a new farm and initialize onboarding.
        """
        farm = Farm(name=farm_name, owner_id=owner_id, is_active=True)
        self.db.add(farm)
        self.db.flush()
        
        onboarding = FarmOnboarding(farm_id=farm.id)
        self.db.add(onboarding)
        
        self.db.commit()
        return farm

    def seed_demo_data(self, farm_id: UUID):
        """
        Creates a 'Demo Herd' for new pilot users to explore the features.
        """
        breeds = ["Holstein", "Jersey", "Gir", "Sahiwal"]
        cattle_list = []
        
        for i in range(5):
            c = Cattle(
                farm_id=farm_id,
                tag_id=f"DEMO-{random.randint(1000, 9999)}",
                name=f"Demo Cow {i+1}",
                breed=random.choice(breeds),
                gender=CattleGender.FEMALE,
                date_of_birth=date.today() - timedelta(days=random.randint(500, 2000)),
                status=CattleStatus.ACTIVE
            )
            self.db.add(c)
            cattle_list.append(c)
        
        self.db.flush()
        
        # Add some historical milk logs
        for c in cattle_list:
            for d in range(7):
                log = MilkLog(
                    farm_id=farm_id,
                    cattle_id=c.id,
                    quantity_liters=random.uniform(10, 25),
                    session="Morning",
                    created_at=datetime.utcnow() - timedelta(days=d)
                )
                self.db.add(log)
        
        self.db.commit()

    def calculate_success_scores(self, farm_id: UUID) -> Dict[str, float]:
        """
        Calculates activation and churn risk scores.
        """
        onboarding = self.db.query(FarmOnboarding).filter(FarmOnboarding.farm_id == farm_id).first()
        if not onboarding:
            return {"activation": 0, "churn_risk": 0}

        # Activation Score (0-100)
        # Based on checklist completion
        completed = sum(1 for v in onboarding.checklist_json.values() if v)
        activation_score = (completed / len(onboarding.checklist_json)) * 100
        
        # Churn Risk (0-100)
        # Higher if no logs in last 3 days
        last_log = self.db.query(MilkLog).filter(MilkLog.farm_id == farm_id).order_by(MilkLog.created_at.desc()).first()
        days_since_active = (datetime.utcnow() - last_log.created_at).days if last_log else 30
        
        churn_risk = min(100, days_since_active * 10)
        
        return {
            "activation_score": activation_score,
            "churn_risk": churn_risk
        }
