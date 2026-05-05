import secrets
import hashlib
import logging
from datetime import datetime, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.core.redis import redis_client
from app.core.config import settings
from app.services import user as user_service
from app.services.email_service import email_service
from app.services.audit_service import audit_service
from app.services.session_service import session_service
from fastapi import Request, HTTPException, status, Response

logger = logging.getLogger("security.password_reset")

class PasswordResetService:
    def __init__(self):
        self.redis = redis_client
        self.ttl = 3600 # 1 hour

    def _get_token_key(self, token_hash: str) -> str:
        return f"pwd_reset_token:{token_hash}"

    def _get_rate_limit_key(self, email: str) -> str:
        return f"pwd_reset_rate:{email}"

    def _hash_token(self, token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()

    async def initiate_reset(self, db: Session, email: str, request: Request):
        """
        Generates a secure reset token, hashes it, and sends via email.
        """
        # 1. Rate limiting (e.g., 3 requests per hour)
        rate_key = self._get_rate_limit_key(email)
        count = self.redis.incr(rate_key)
        if count == 1:
            self.redis.expire(rate_key, 3600)
        
        if count > 3:
            logger.warning(f"Password reset rate limit exceeded for {email}")
            # Still return success to prevent enumeration
            return

        user = user_service.get_by_email(db, email=email)
        if not user:
            # Silently fail to prevent account enumeration
            return

        # 2. Generate secure token
        raw_token = secrets.token_urlsafe(48)
        token_hash = self._hash_token(raw_token)
        
        # 3. Store hashed token in Redis (Single use only)
        # We store the user_id as the value
        self.redis.setex(self._get_token_key(token_hash), self.ttl, str(user.id))
        
        # 4. Send Email
        reset_link = f"https://cattleos.com/reset-password?token={raw_token}"
        email_service.send_password_reset(email, reset_link)
        
        audit_service.log_event(
            db, 
            "PWD_RESET_INITIATED", 
            user_id=user.id, 
            request=request,
            metadata={"ip": request.client.host}
        )

    async def confirm_reset(self, db: Session, raw_token: str, new_password: str, request: Request):
        """
        Validates the token, updates password, and revokes token.
        """
        token_hash = self._hash_token(raw_token)
        token_key = self._get_token_key(token_hash)
        
        user_id_str = self.redis.get(token_key)
        if not user_id_str:
            audit_service.log_event(db, "PWD_RESET_FAIL_INVALID_TOKEN", request=request)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )

        # Decode if bytes
        if isinstance(user_id_str, bytes):
            user_id_str = user_id_str.decode()

        # Token is valid - Revoke immediately (Single use)
        self.redis.delete(token_key)
        
        user = user_service.get_by_id(db, user_id=user_id_str)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update password
        user_service.update(db, db_obj=user, obj_in={"password": new_password})
        
        # Global session revocation (Security best practice)
        await session_service.logout_all(db, user.id, Response())
        
        audit_service.log_event(
            db, 
            "PWD_RESET_SUCCESS", 
            user_id=user.id, 
            request=request
        )
        
        return {"message": "Password successfully reset. All active sessions have been invalidated."}

password_reset_service = PasswordResetService()
