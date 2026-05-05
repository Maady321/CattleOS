import enum
from typing import List, Dict
from app.models.user import UserRole

class Permission(str, enum.Enum):
    # User Management
    MANAGE_USERS = "manage_users"
    INVITE_USERS = "invite_users"
    
    # Farm Management
    VIEW_FARM = "view_farm"
    EDIT_FARM = "edit_farm"
    DELETE_FARM = "delete_farm"
    
    # Resource Management
    VIEW_RESOURCES = "view_resources"
    MANAGE_RESOURCES = "manage_resources"
    RECORD_HEALTH = "record_health"
    
    # Financials
    VIEW_FINANCIALS = "view_financials"

# Permission Matrix: Mapping Roles to Permissions
ROLE_PERMISSIONS: Dict[str, List[Permission]] = {
    "superadmin": [p for p in Permission],
    "farm_owner": [
        Permission.MANAGE_USERS, Permission.INVITE_USERS,
        Permission.VIEW_FARM, Permission.EDIT_FARM,
        Permission.VIEW_RESOURCES, Permission.MANAGE_RESOURCES, Permission.RECORD_HEALTH,
        Permission.VIEW_FINANCIALS
    ],
    "manager": [
        Permission.INVITE_USERS,
        Permission.VIEW_FARM, Permission.VIEW_RESOURCES, 
        Permission.MANAGE_RESOURCES, Permission.RECORD_HEALTH
    ],
    "worker": [
        Permission.VIEW_FARM, Permission.VIEW_RESOURCES, Permission.RECORD_HEALTH
    ],
    "vet": [
        Permission.VIEW_FARM, Permission.VIEW_RESOURCES, Permission.RECORD_HEALTH
    ],
    "viewer": [
        Permission.VIEW_FARM, Permission.VIEW_RESOURCES
    ]
}
