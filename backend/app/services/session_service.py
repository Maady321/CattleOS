import uuid
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from fastapi import Request, HTTPException, status, Response
from app.models.session import UserSession
from app.core.redis import redis_client
from app.core import security
from app.core.config import settings

logger = logging.getLogger("security.session")

from app.services.csrf_service import csrf_service

class SessionService:
    def _get_revocation_key(self, jti: str) -> str:
        return f"revoked_token:{jti}"

    def _get_family_block_key(self, family_id: str) -> str:
        return f"blocked_family:{family_id}"

    async def create_session(
        self, 
        db: Session, 
        user_id: uuid.UUID, 
        request: Request,
        response: Response
    ) -> Tuple[str, str]:
        """
        Creates a new session, issues access/refresh tokens, and sets secure cookies.
        """
        family_id = uuid.uuid4()
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        # Create DB session record
        db_session = UserSession(
            user_id=user_id,
            family_id=family_id,
            device_id=None,
            user_agent=request.headers.get("user-agent"),
            ip_address=request.client.host,
            expires_at=expires_at
        )
        db.add(db_session)
        db.commit()
        db.refresh(db_session)

        access_token = security.create_access_token(user_id, family_id)
        refresh_token = security.create_refresh_token(user_id, family_id)
        
        # 1. Set refresh token in HttpOnly cookie
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.SECURE_COOKIE,
            samesite=settings.COOKIE_SAMESITE,
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
            path=f"{settings.API_V1_STR}/auth/refresh"
        )

        # 2. Set CSRF cookie
        csrf_token = csrf_service.generate_token()
        csrf_service.set_csrf_cookie(response, csrf_token)

        return access_token, refresh_token

    async def refresh_session(
        self, 
        db: Session, 
        refresh_token: str,
        request: Request,
        response: Response
    ) -> str:
        """
        Handles token rotation. If a reuse is detected, invalidates the entire family.
        """
        payload = security.decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        jti = payload.get("jti")
        family_id = payload.get("fid")
        user_id = payload.get("sub")

        # 1. Check if token is explicitly revoked
        if self.redis_is_revoked(jti):
            # Potential reuse attack!
            from app.core.metrics import SESSION_COMPROMISED
            SESSION_COMPROMISED.inc()
            logger.warning(f"TOKEN REUSE DETECTED: jti {jti}, family {family_id}")
            self.revoke_family(db, family_id)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session compromised. Please login again.")

        # 2. Check if family is blocked in Redis
        if self.redis_is_family_blocked(family_id):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")

        # 3. Verify session in DB
        db_session = db.query(UserSession).filter(
            UserSession.family_id == family_id,
            UserSession.is_active == True
        ).first()

        if not db_session or db_session.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session inactive")

        # Suspicious login detection: Check IP/UA change
        current_ip = request.client.host
        if db_session.ip_address != current_ip:
            logger.info(f"Session IP change detected: {db_session.ip_address} -> {current_ip}")
            # Could trigger an email alert here

        # 4. Token Rotation
        # Revoke the used JTI
        exp = payload.get("exp")
        ttl = int(exp - datetime.now(timezone.utc).timestamp())
        if ttl > 0:
            redis_client.setex(self._get_revocation_key(jti), ttl, "1")

        # Issue new tokens
        new_access_token = security.create_access_token(user_id, family_id)
        new_refresh_token = security.create_refresh_token(user_id, family_id)

        # Update cookie
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            secure=settings.SECURE_COOKIE,
            samesite=settings.COOKIE_SAMESITE,
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
            path=f"{settings.API_V1_STR}/auth/refresh"
        )

        # Rotate CSRF cookie
        csrf_token = csrf_service.generate_token()
        csrf_service.set_csrf_cookie(response, csrf_token)

        return new_access_token

    def redis_is_revoked(self, jti: str) -> bool:
        return redis_client.exists(self._get_revocation_key(jti))

    def redis_is_family_blocked(self, family_id: str) -> bool:
        return redis_client.exists(self._get_family_block_key(family_id))

    def revoke_family(self, db: Session, family_id: str):
        """
        Invalidates an entire session family.
        """
        db.query(UserSession).filter(UserSession.family_id == family_id).update({"is_active": False})
        db.commit()
        # Block in Redis for 30 days (safety net)
        redis_client.setex(self._get_family_block_key(family_id), settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, "1")

    async def logout(self, db: Session, refresh_token: str, response: Response):
        """
        Logs out current session.
        """
        payload = security.decode_token(refresh_token)
        if payload:
            self.revoke_family(db, payload.get("fid"))
        
        response.delete_cookie("refresh_token", path=f"{settings.API_V1_STR}/auth/refresh")
        response.delete_cookie("csrf_token")

    async def logout_all(self, db: Session, user_id: uuid.UUID, response: Response):
        """
        Invalidates all active sessions for a user.
        """
        sessions = db.query(UserSession).filter(UserSession.user_id == user_id, UserSession.is_active == True).all()
        for sess in sessions:
            self.revoke_family(db, str(sess.family_id))
        
        response.delete_cookie("refresh_token", path=f"{settings.API_V1_STR}/auth/refresh")
        response.delete_cookie("csrf_token")

session_service = SessionService()
