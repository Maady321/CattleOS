from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.core.config import settings
from app.schemas.user import User, UserCreate, Token
from app.services import user as user_service

from app.services.email_service import email_service
import random

router = APIRouter()

# Temporary in-memory storage for OTPs (In production, use Redis)
otp_storage = {}

@router.post("/send-otp")
def send_otp(email: str) -> Any:
    """
    Generate and send OTP to email
    """
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # Store OTP
    otp_storage[email] = otp
    
    # Send via Email service
    success = email_service.send_otp(email, otp)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email. Please try again later.")
    
    return {"message": "Code sent successfully"}

@router.post("/verify-otp")
def verify_otp(
    email: str, 
    otp: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Verify OTP and return access token
    """
    stored_otp = otp_storage.get(email)
    
    if not stored_otp or stored_otp != otp:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    
    # Get user by email
    user = user_service.get_by_email(db, email=email)
    
    if not user:
        # For this demo, if user doesn't exist, we'll create a dummy one
        # In production, you'd require registration
        user_in = UserCreate(
            email=email,
            full_name="Farm Owner",
            password=security.get_password_hash(random.getrandbits(128).to_bytes(16, 'big').hex()),
            phone_number=""
        )
        user = user_service.create(db, obj_in=user_in)

    # Clear OTP after successful verification
    del otp_storage[email]
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = user_service.authenticate(
        db, phone_number=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect phone number or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=User)
def register_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = user_service.get_by_phone(db, phone_number=user_in.phone_number)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this phone number already exists in the system.",
        )
    return user_service.create(db, obj_in=user_in)
