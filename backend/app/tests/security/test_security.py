import pytest
from fastapi import HTTPException
from app.services.resource_auth_service import resource_auth_service
from app.core.permissions import Permission
from app.tests.factories import UserFactory, FarmFactory, FarmMembershipFactory
from app.models.user import UserRole

def test_idor_cross_farm_access(db):
    """Prevent User A from accessing User B's farm."""
    user_a = UserFactory()
    farm_a = FarmFactory()
    FarmMembershipFactory(user=user_a, farm=farm_a, role=UserRole.OWNER)
    
    user_b = UserFactory()
    farm_b = FarmFactory()
    FarmMembershipFactory(user=user_b, farm=farm_b, role=UserRole.OWNER)
    
    # User A tries to access Farm B
    with pytest.raises(HTTPException) as exc:
        resource_auth_service.authorize_resource_access(
            db, user_a, "farm", farm_b.id, Permission.VIEW_FARM
        )
    assert exc.value.status_code == 403
    assert "not a member" in exc.value.detail.lower()

def test_privilege_escalation_worker_delete_farm(db):
    """Prevent Worker from performing Owner-only actions."""
    user = UserFactory()
    farm = FarmFactory()
    # User is just a worker in this farm
    FarmMembershipFactory(user=user, farm=farm, role=UserRole.WORKER)
    
    with pytest.raises(HTTPException) as exc:
        resource_auth_service.authorize_resource_access(
            db, user, "farm", farm.id, Permission.DELETE_FARM
        )
    assert exc.value.status_code == 403
    assert "insufficient permissions" in exc.value.detail.lower()

@pytest.mark.asyncio
async def test_csrf_bypass_attempt(client, auth_headers):
    """Verify that state-changing requests fail without CSRF token."""
    # Logout is a POST request that requires CSRF
    resp = await client.post(
        "/api/v1/auth/logout",
        headers=auth_headers # No CSRF header
    )
    # The middleware should catch this
    assert resp.status_code == 403
    assert "csrf" in resp.json()["detail"].lower()

@pytest.mark.asyncio
async def test_rate_limit_bypass_attempt(client, mock_redis):
    """Verify rate limiting on OTP requests."""
    email = "target@example.com"
    # Flood requests
    for i in range(15): # Limit is 10
        resp = await client.post(
            "/api/v1/auth/login/initiate",
            json={"identifier": email, "password": "any", "device_fingerprint": f"fp-{i}"}
        )
        if i >= 10:
            assert resp.status_code == 429
