import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException
from app.core.rbac import Checker, Permission
from app.models.user import User, UserRole

def test_checker_superadmin_bypass():
    user = MagicMock(spec=User)
    user.is_superuser = True
    user.role = UserRole.SUPERADMIN
    
    checker = Checker([Permission.MANAGE_USERS])
    # Should not raise any exception
    assert checker(current_user=user) is True

def test_checker_allowed_permission():
    user = MagicMock(spec=User)
    user.is_superuser = False
    user.role = UserRole.FARM_OWNER
    
    # FARM_OWNER has Permission.INVITE_USERS
    checker = Checker([Permission.INVITE_USERS])
    assert checker(current_user=user) is True

def test_checker_denied_permission():
    user = MagicMock(spec=User)
    user.is_superuser = False
    user.role = UserRole.WORKER
    
    # WORKER does NOT have Permission.MANAGE_USERS
    checker = Checker([Permission.MANAGE_USERS])
    
    with pytest.raises(HTTPException) as excinfo:
        checker(current_user=user)
    
    assert excinfo.value.status_code == 403
    assert "not have enough permissions" in excinfo.value.detail

def test_checker_viewer_permissions():
    user = MagicMock(spec=User)
    user.is_superuser = False
    user.role = UserRole.VIEWER
    
    # VIEWER can view farm
    checker_view = Checker([Permission.VIEW_FARM])
    assert checker_view(current_user=user) is True
    
    # VIEWER cannot edit farm
    checker_edit = Checker([Permission.EDIT_FARM])
    with pytest.raises(HTTPException):
        checker_edit(current_user=user)
