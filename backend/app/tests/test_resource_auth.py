import pytest
import uuid
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from app.services.resource_auth_service import ResourceAuthService
from app.models.user import User
from app.models.farm import Farm, FarmMembership
from app.core.rbac import Permission

@pytest.fixture
def auth_service():
    return ResourceAuthService()

@pytest.fixture
def mock_db():
    return MagicMock()

def test_get_resource_farm_id_farm(auth_service, mock_db):
    farm_id = uuid.uuid4()
    resolved = auth_service.get_resource_farm_id(mock_db, "farm", farm_id)
    assert resolved == farm_id

@patch("app.services.resource_auth_service.audit_service")
def test_authorize_resource_access_no_membership(mock_audit, auth_service, mock_db):
    user = User(id=uuid.uuid4(), is_superuser=False)
    farm_id = uuid.uuid4()
    
    # 1. Resolve farm ID (Mock)
    with patch.object(auth_service, 'get_resource_farm_id', return_value=farm_id):
        # 2. Mock farm and membership query
        mock_db.query().filter().first.side_effect = [
            Farm(id=farm_id, status="ACTIVE", is_deleted=False), # Farm query
            None # Membership query (not found)
        ]
        
        with pytest.raises(HTTPException) as exc:
            auth_service.authorize_resource_access(mock_db, user, "cattle", "c1", Permission.VIEW_RESOURCES)
        
        assert exc.value.status_code == 403
        assert "not a member" in exc.value.detail.lower()
        mock_audit.log_event.assert_called_once()

@patch("app.services.resource_auth_service.audit_service")
def test_authorize_resource_access_insufficient_role(mock_audit, auth_service, mock_db):
    user = User(id=uuid.uuid4(), is_superuser=False)
    farm_id = uuid.uuid4()
    
    with patch.object(auth_service, 'get_resource_farm_id', return_value=farm_id):
        mock_db.query().filter().first.side_effect = [
            Farm(id=farm_id, status="ACTIVE", is_deleted=False), # Farm query
            FarmMembership(user_id=user.id, farm_id=farm_id, role="viewer", status="ACTIVE") # Membership
        ]
        
        # viewer trying to manage resources
        with pytest.raises(HTTPException) as exc:
            auth_service.authorize_resource_access(mock_db, user, "cattle", "c1", Permission.MANAGE_RESOURCES)
        
        assert exc.value.status_code == 403
        assert "insufficient permissions" in exc.value.detail.lower()
