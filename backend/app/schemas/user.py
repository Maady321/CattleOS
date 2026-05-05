import uuid
from typing import Optional
from pydantic import EmailStr
from app.core.validation import SecureBaseModel, SanitizedStr

class BotProtectionBase(SecureBaseModel):
    captcha_token: Optional[str] = None
    device_fingerprint: Optional[str] = None
    website_url: Optional[str] = None # Honeypot field

class UserBase(SecureBaseModel):
    email: Optional[EmailStr] = None
    phone_number: SanitizedStr
    full_name: SanitizedStr
    language: SanitizedStr = "en"

class UserCreate(UserBase, BotProtectionBase):
    password: str

class LoginRequest(BotProtectionBase):
    identifier: str
    password: str

class PasswordResetRequest(BotProtectionBase):
    email: EmailStr

class UserUpdate(SecureBaseModel):
    email: Optional[EmailStr] = None
    phone_number: Optional[SanitizedStr] = None
    full_name: Optional[SanitizedStr] = None
    language: Optional[SanitizedStr] = None
    password: Optional[str] = None

class User(UserBase):
    id: uuid.UUID
    is_active: bool
    is_verified: bool
    is_superuser: bool

    class Config:
        from_attributes = True

class Token(SecureBaseModel):
    access_token: str
    token_type: str

class TokenPayload(SecureBaseModel):
    sub: Optional[str] = None

class PasswordResetConfirm(SecureBaseModel):
    token: str
    new_password: str
