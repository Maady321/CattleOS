from typing import Generator, Optional, List
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from app.services.csrf_service import csrf_service
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.core import security
from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User
from app.schemas.user import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login/access-token"
)

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user

from app.core.permissions import Permission, ROLE_PERMISSIONS
from app.services.resource_auth_service import resource_auth_service

async def verify_csrf(request: Request):
    """
    Selectively verify CSRF for state-changing requests.
    """
    await csrf_service.validate_csrf(request)

class RoleChecker:
    def __init__(self, allowed_permissions: List[Permission]):
        self.allowed_permissions = allowed_permissions

    def __call__(self, current_user: User = Depends(get_current_active_user)):
        # Superusers bypass all checks
        if current_user.is_superuser:
            return True
        
        user_perms = ROLE_PERMISSIONS.get(current_user.role, [])
        for perm in self.allowed_permissions:
            if perm in user_perms:
                return True
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have enough permissions to perform this action"
        )

def has_permission(permissions: List[Permission]):
    return RoleChecker(permissions)

class ResourceAccess:
    def __init__(self, resource_type: str, permission: Permission):
        self.resource_type = resource_type
        self.permission = permission

    def __call__(
        self,
        resource_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user),
        request: Request = None
    ):
        resource_auth_service.authorize_resource_access(
            db, current_user, self.resource_type, resource_id, self.permission, request
        )
        return resource_id
