import pytest
from uuid import uuid4
from datetime import datetime
from app.core.integrity_engine import IntegrityEngine
from app.models.logs import MilkLog
from app.models.integrity import DataAnomaly

def test_outlier_detection(db_session):
    farm_id = uuid4()
    
    # Create normal data
    for i in range(10):
        log = MilkLog(
            id=uuid4(),
            farm_id=farm_id,
            cattle_id=uuid4(),
            quantity_liters=10.0 + i,
            session="Morning"
        )
        db_session.add(log)
    
    # Create an outlier
    outlier = MilkLog(
        id=uuid4(),
        farm_id=farm_id,
        cattle_id=uuid4(),
        quantity_liters=500.0, # Way too much for a cow!
        session="Morning"
    )
    db_session.add(outlier)
    db_session.commit()
    
    engine = IntegrityEngine(db_session)
    anomalies = engine.detect_outliers(farm_id, MilkLog, "quantity_liters")
    
    assert len(anomalies) == 1
    assert anomalies[0].resource_id == outlier.id
    assert anomalies[0].anomaly_type == "OUTLIER"

def test_immutable_records_logic(db_session):
    # This test would verify that updates to MilkLog fail if we had the listener active
    # For now, it's a structural check
    pass
