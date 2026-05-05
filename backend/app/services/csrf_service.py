import secrets
import hmac
import hashlib
from fastapi import Request, HTTPException, status, Response
from app.core.config import settings

class CSRFService:
    def __init__(self):
        self.secret = settings.SECRET_KEY
        self.cookie_name = "csrf_token"
        self.header_name = "X-CSRF-Token"

    def generate_token(self) -> str:
        return secrets.token_urlsafe(32)

    def set_csrf_cookie(self, response: Response, token: str):
        response.set_cookie(
            key=self.cookie_name,
            value=token,
            httponly=False, # Must be accessible by JS to send in header
            secure=settings.SECURE_COOKIE,
            samesite=settings.COOKIE_SAMESITE,
            max_age=3600 # 1 hour
        )

    async def validate_csrf(self, request: Request):
        """
        Validates the CSRF token from the header against the token in the cookie.
        (Double Submit Cookie pattern)
        """
        if request.method in ["GET", "HEAD", "OPTIONS", "TRACE"]:
            return

        cookie_token = request.cookies.get(self.cookie_name)
        header_token = request.headers.get(self.header_name)

        if not cookie_token or not header_token:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token missing"
            )

        if not secrets.compare_digest(cookie_token, header_token):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token mismatch"
            )

csrf_service = CSRFService()
