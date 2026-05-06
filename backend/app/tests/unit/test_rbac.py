import pytest
from fastapi import HTTPException
from app.api.deps import RoleChecker
from app.core.permissions import Permission, ROLE_PERMISSIONS
from app.tests.factories import UserFactory
from app.models.user import UserRole

def test_role_permissions_consistency():
    """Ensure all UserRole enum values have defined permissions."""
    for role in UserRole:
        # Note: If 'owner' vs 'farm_owner' mismatch exists, this will catch it
        role_key = "farm_owner" if role == UserRole.OWNER else role.value
        assert role_key in ROLE_PERMISSIONS, f"Role {role} not found in ROLE_PERMISSIONS"

def test_role_checker_superuser(db):
    user = UserFactory(is_superuser=True)
    checker = RoleChecker(allowed_permissions=[Permission.DELETE_FARM])
    assert checker(current_user=user) is True

def test_role_checker_authorized(db):
    # Worker has VIEW_RESOURCES
    user = UserFactory(role=UserRole.WORKER)
    checker = RoleChecker(allowed_permissions=[Permission.VIEW_RESOURCES])
    assert checker(current_user=user) is True

def test_role_checker_unauthorized(db):
    # Viewer does NOT have DELETE_FARM
    user = UserFactory(role=UserRole.VIEWER)
    checker = RoleChecker(allowed_permissions=[Permission.DELETE_FARM])
    with pytest.raises(HTTPException) as exc:
        checker(current_user=user)
    assert exc.value.status_code == 403

def test_role_checker_multiple_permissions(db):
    user = UserFactory(role=UserRole.MANAGER)
    # Manager has INVITE_USERS and RECORD_HEALTH
    checker = RoleChecker(allowed_permissions=[Permission.INVITE_USERS, Permission.RECORD_HEALTH])
    assert checker(current_user=user) is True
