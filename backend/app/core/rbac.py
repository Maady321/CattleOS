from typing import List, Optional
from app.core.permissions import Permission, ROLE_PERMISSIONS

class RBACManager:
    def has_permission(self, role: str, permission: Permission) -> bool:
        """
        Check if a role has a specific permission.
        """
        perms = ROLE_PERMISSIONS.get(role, [])
        return permission in perms

rbac_manager = RBACManager()
