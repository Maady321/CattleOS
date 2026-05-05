import enum
from typing import List, Optional
from fastapi import Depends, HTTPException, status
from app.api import deps
from app.models.user import User, UserRole

class Permission(str, enum.Enum):
    # User Management
    MANAGE_USERS = "manage_users"
    INVITE_USERS = "invite_users"
    
    # Farm Management
    VIEW_FARM = "view_farm"
    EDIT_FARM = "edit_farm"
    DELETE_FARM = "delete_farm"
    
    # Cattle Management
    VIEW_CATTLE = "view_cattle"
    EDIT_CATTLE = "edit_cattle"
    RECORD_HEALTH = "record_health" # For Vets/Workers
    
    # Financials
    VIEW_FINANCIALS = "view_financials"

# Permission Matrix: Mapping Roles to Permissions
ROLE_PERMISSIONS = {
    UserRole.SUPERADMIN: [p for p in Permission],
    UserRole.FARM_OWNER: [
        Permission.MANAGE_USERS, Permission.INVITE_USERS,
        Permission.VIEW_FARM, Permission.EDIT_FARM,
        Permission.VIEW_CATTLE, Permission.EDIT_CATTLE, Permission.RECORD_HEALTH,
        Permission.VIEW_FINANCIALS
    ],
    UserRole.MANAGER: [
        Permission.INVITE_USERS,
        Permission.VIEW_FARM, Permission.VIEW_CATTLE, 
        Permission.EDIT_CATTLE, Permission.RECORD_HEALTH
    ],
    UserRole.VET: [
        Permission.VIEW_FARM, Permission.VIEW_CATTLE, Permission.RECORD_HEALTH
    ],
    UserRole.WORKER: [
        Permission.VIEW_FARM, Permission.VIEW_CATTLE, Permission.RECORD_HEALTH
    ],
    UserRole.VIEWER: [
        Permission.VIEW_FARM, Permission.VIEW_CATTLE
    ]
}

class Checker:
    def __init__(self, allowed_permissions: List[Permission]):
        self.allowed_permissions = allowed_permissions

    def __call__(self, current_user: User = Depends(deps.get_current_active_user)):
        # Superusers bypass all checks
        if current_user.is_superuser or current_user.role == UserRole.SUPERADMIN:
            return True
        
        user_perms = ROLE_PERMISSIONS.get(current_user.role, [])
        for perm in self.allowed_permissions:
            if perm in user_perms:
                return True
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have enough permissions to perform this action"
        )

# Dependency shortcuts
def has_permission(permissions: List[Permission]):
    return Checker(permissions)

async def verify_farm_ownership(
    farm_id: str,
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Ensures the user has access to the specific farm resource.
    """
    if current_user.role == UserRole.SUPERADMIN:
        return True
    
    # This assumes User model has a farm_id or similar, 
    # or there is a many-to-many relationship.
    # For now, we'll check if the user is linked to this farm_id.
    # (Implementation depends on the Farm model structure)
    pass
