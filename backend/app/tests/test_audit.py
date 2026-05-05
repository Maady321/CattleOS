import pytest
import uuid
from unittest.mock import MagicMock
from app.services.audit_service import AuditService
from app.models.audit_log import AuditLog

@pytest.fixture
def audit_service():
    return AuditService()

def test_calculate_hash(audit_service):
    log = AuditLog(
        event_type="TEST_EVENT",
        user_id=uuid.uuid4(),
        resource_id="res_123",
        status="SUCCESS"
    )
    h1 = log.calculate_hash("PREV_HASH")
    h2 = log.calculate_hash("PREV_HASH")
    h3 = log.calculate_hash("OTHER_HASH")
    
    assert h1 == h2
    assert h1 != h3

def test_integrity_verification_success(audit_service):
    db = MagicMock()
    
    # Create a chain of 3 logs
    l1 = AuditLog(id=uuid.uuid4(), event_type="E1", previous_hash="INITIAL_BLOCK")
    l1.log_hash = l1.calculate_hash("INITIAL_BLOCK")
    
    l2 = AuditLog(id=uuid.uuid4(), event_type="E2", previous_hash=l1.log_hash)
    l2.log_hash = l2.calculate_hash(l1.log_hash)
    
    db.query().order_by().all.return_value = [l1, l2]
    
    is_valid, broken_id = audit_service.verify_integrity(db)
    assert is_valid is True
    assert broken_id is None

def test_integrity_verification_failure(audit_service):
    db = MagicMock()
    
    l1 = AuditLog(id=uuid.uuid4(), event_type="E1", previous_hash="INITIAL_BLOCK")
    l1.log_hash = l1.calculate_hash("INITIAL_BLOCK")
    
    # Tampered log (wrong previous hash)
    l2 = AuditLog(id=uuid.uuid4(), event_type="E2", previous_hash="TAMPERED")
    l2.log_hash = l2.calculate_hash("TAMPERED")
    
    db.query().order_by().all.return_value = [l1, l2]
    
    is_valid, broken_id = audit_service.verify_integrity(db)
    assert is_valid is False
    assert broken_id == l2.id
