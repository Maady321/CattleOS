from typing import Any, List
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.core.config import settings
from app.schemas.user import User as UserSchema, UserCreate, Token, PasswordResetConfirm, LoginRequest, PasswordResetRequest
from app.services import user as user_service
from app.services.otp_service import otp_service
from app.services.email_service import email_service
from app.services.security_service import security_service
from app.services.audit_service import audit_service
from app.services.session_service import session_service
from app.services.bot_protection_service import bot_service
from app.models.session import UserSession
import random
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/register", response_model=UserSchema)
async def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    request: Request
) -> Any:
    """Step 1: Register unverified account with bot protection."""
    await bot_service.protect(request, user_in.model_dump())
    
    user = user_service.get_by_email(db, email=user_in.email) or \
           user_service.get_by_phone(db, phone_number=user_in.phone_number)
    
    if user:
        audit_service.log_event(db, "REGISTER_FAIL_DUPLICATE", request=request, metadata={"email": user_in.email})
        raise HTTPException(status_code=400, detail="A user with this email or phone already exists.")

    user = user_service.create(db, obj_in=user_in)
    otp = otp_service.generate_otp()
    otp_service.store_otp(user.email, otp, request.client.host)
    email_service.send_otp(user.email, otp)
    
    audit_service.log_event(db, "REGISTER_SUCCESS", user_id=user.id, request=request)
    return user

@router.post("/verify-registration")
async def verify_registration(
    *,
    db: Session = Depends(deps.get_db),
    email: str,
    otp: str,
    request: Request
) -> Any:
    """Step 2: Verify registration OTP."""
    await security_service.check_abuse(request, email)
    user = user_service.get_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    is_valid, message = otp_service.verify_otp(email, otp)
    if not is_valid:
        await security_service.track_failure(request, email)
        audit_service.log_event(db, "VERIFY_REG_FAIL", user_id=user.id, request=request, metadata={"reason": message})
        raise HTTPException(status_code=400, detail=message)

    user_service.update(db, db_obj=user, obj_in={"is_verified": True})
    await security_service.reset_failures(request, email)
    audit_service.log_event(db, "VERIFY_REG_SUCCESS", user_id=user.id, request=request)
    return {"message": "Account verified. You can now login."}

@router.post("/login/initiate")
async def login_initiate(
    *,
    db: Session = Depends(deps.get_db),
    login_in: LoginRequest,
    request: Request
) -> Any:
    """Step 3: Authenticate password and send 2FA OTP with bot protection."""
    await bot_service.protect(request, login_in.model_dump())
    await security_service.check_abuse(request, login_in.identifier)
    
    user = user_service.authenticate(db, identifier=login_in.identifier, password=login_in.password)
    
    if not user:
        await security_service.track_failure(request, login_in.identifier)
        audit_service.log_event(db, "LOGIN_FAIL_CREDENTIALS", request=request, metadata={"identifier": login_in.identifier})
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Account not verified.")

    otp = otp_service.generate_otp()
    otp_service.store_otp(user.email, otp, request.client.host)
    email_service.send_otp(user.email, otp)
    
    audit_service.log_event(db, "LOGIN_INITIATED", user_id=user.id, request=request)
    return {"message": "Verification code sent.", "email": user.email}

@router.post("/login/verify", response_model=Token)
async def login_verify(
    *,
    db: Session = Depends(deps.get_db),
    email: str,
    otp: str,
    request: Request,
    response: Response
) -> Any:
    """Step 4: Verify login OTP and create secure session."""
    await security_service.check_abuse(request, email)
    user = user_service.get_by_email(db, email=email)
    if not user or not user.is_verified:
        raise HTTPException(status_code=400, detail="Invalid request")

    is_valid, message = otp_service.verify_otp(email, otp)
    if not is_valid:
        await security_service.track_failure(request, email)
        audit_service.log_event(db, "LOGIN_VERIFY_FAIL", user_id=user.id, request=request, metadata={"reason": message})
        raise HTTPException(status_code=400, detail=message)

    # Success: Create session and tokens
    await security_service.reset_failures(request, email)
    access_token, _ = await session_service.create_session(db, user.id, request, response)
    
    audit_service.log_event(db, "LOGIN_SUCCESS", user_id=user.id, request=request)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token, dependencies=[Depends(deps.verify_csrf)])
async def refresh_token(
    *,
    db: Session = Depends(deps.get_db),
    request: Request,
    response: Response,
    refresh_token: str = Cookie(None)
) -> Any:
    """Rotate tokens using refresh token from secure cookie."""
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    new_access_token = await session_service.refresh_session(db, refresh_token, request, response)
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/logout", dependencies=[Depends(deps.verify_csrf)])
async def logout(
    *,
    db: Session = Depends(deps.get_db),
    response: Response,
    refresh_token: str = Cookie(None)
) -> Any:
    """Logout current session."""
    if refresh_token:
        await session_service.logout(db, refresh_token, response)
    return {"message": "Successfully logged out"}

@router.post("/logout-all")
async def logout_all(
    *,
    db: Session = Depends(deps.get_db),
    response: Response,
    current_user: UserSchema = Depends(deps.get_current_active_user)
) -> Any:
    """Invalidate all sessions for the current user."""
    await session_service.logout_all(db, current_user.id, response)
    return {"message": "All sessions successfully invalidated"}

@router.get("/sessions", response_model=List[Any])
async def get_active_sessions(
    *,
    db: Session = Depends(deps.get_db),
    current_user: UserSchema = Depends(deps.get_current_active_user)
) -> Any:
    """List active device sessions."""
    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active == True
    ).all()
    return sessions

from app.services.password_reset_service import password_reset_service

@router.post("/password-reset/request")
async def password_reset_request(
    *,
    db: Session = Depends(deps.get_db),
    reset_in: PasswordResetRequest,
    request: Request
) -> Any:
    """
    Step 1: Request password reset link with bot protection.
    """
    await bot_service.protect(request, reset_in.model_dump())
    await security_service.check_abuse(request, reset_in.email)
    await password_reset_service.initiate_reset(db, reset_in.email, request)
    return {"message": "If an account exists with this email, a reset link has been sent."}

@router.post("/password-reset/confirm", dependencies=[Depends(deps.verify_csrf)])
async def password_reset_confirm(
    *,
    db: Session = Depends(deps.get_db),
    body: PasswordResetConfirm,
    request: Request
) -> Any:
    """
    Step 2: Confirm password reset with token.
    """
    # Note: We don't have the identifier (email) yet, but the service will find it from the token.
    # We apply CSRF protection because this is a mutating state change.
    return await password_reset_service.confirm_reset(db, body.token, body.new_password, request)

@router.post("/unlock", tags=["admin"])
def unlock_account(
    identifier: str = None, 
    ip: str = None,
    current_user: UserSchema = Depends(deps.get_current_active_superuser)
) -> Any:
    security_service.admin_unlock(identifier=identifier, ip=ip)
    return {"message": "Account/IP unlocked"}
