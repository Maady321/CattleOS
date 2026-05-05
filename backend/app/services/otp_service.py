import logging
import random
import time
from typing import Optional, Tuple
from app.core.config import settings
from app.core.redis import redis_client
from app.core.security import get_password_hash, verify_password

# Structured logging setup
logger = logging.getLogger(__name__)

class OTPService:
    def __init__(self):
        self.redis = redis_client
        self.otp_ttl = settings.OTP_TTL
        self.max_attempts = settings.OTP_MAX_ATTEMPTS
        self.resend_cooldown = settings.OTP_RESEND_COOLDOWN
        self.rate_limit_window = settings.OTP_RATE_LIMIT_WINDOW
        self.rate_limit_max = settings.OTP_RATE_LIMIT_MAX_REQUESTS

    def _get_otp_key(self, email: str) -> str:
        return f"otp:{email}"

    def _get_attempts_key(self, email: str) -> str:
        return f"otp_attempts:{email}"

    def _get_cooldown_key(self, email: str) -> str:
        return f"otp_cooldown:{email}"

    def _get_rate_limit_key(self, identifier: str) -> str:
        return f"otp_rate_limit:{identifier}"

    def generate_otp(self) -> str:
        return f"{random.randint(100000, 999999):06d}"

    def can_send_otp(self, email: str, ip_address: str) -> Tuple[bool, Optional[str]]:
        """
        Check if an OTP can be sent based on cooldown and rate limits.
        """
        # Check cooldown (resend limit)
        if self.redis.exists(self._get_cooldown_key(email)):
            return False, "Please wait before requesting a new code."

        # Check rate limit per email
        email_limit_key = self._get_rate_limit_key(email)
        email_requests = self.redis.get(email_limit_key)
        if email_requests and int(email_requests) >= self.rate_limit_max:
            logger.warning(f"Rate limit exceeded for email: {email}")
            return False, "Too many requests. Please try again later."

        # Check rate limit per IP
        ip_limit_key = self._get_rate_limit_key(ip_address)
        ip_requests = self.redis.get(ip_limit_key)
        if ip_requests and int(ip_requests) >= self.rate_limit_max * 2: # IP limit is slightly higher
            logger.warning(f"Rate limit exceeded for IP: {ip_address}")
            return False, "Too many requests. Please try again later."

        return True, None

    def store_otp(self, email: str, otp: str, ip_address: str):
        """
        Hash and store OTP in Redis with TTL and update rate limits.
        """
        hashed_otp = get_password_hash(otp)
        
        # Store hashed OTP
        self.redis.setex(self._get_otp_key(email), self.otp_ttl, hashed_otp)
        
        # Set resend cooldown
        self.redis.setex(self._get_cooldown_key(email), self.resend_cooldown, "1")
        
        # Reset attempts for new OTP
        self.redis.delete(self._get_attempts_key(email))
        
        # Increment rate limit counters
        for identifier in [email, ip_address]:
            key = self._get_rate_limit_key(identifier)
            pipe = self.redis.pipeline()
            pipe.incr(key)
            pipe.expire(key, self.rate_limit_window)
            pipe.execute()

        logger.info(f"OTP generated and stored for email: {email}")

    def verify_otp(self, email: str, otp: str) -> Tuple[bool, str]:
        """
        Verify OTP, track attempts, and delete on success.
        """
        otp_key = self._get_otp_key(email)
        attempts_key = self._get_attempts_key(email)

        hashed_otp = self.redis.get(otp_key)
        if not hashed_otp:
            return False, "Invalid or expired code"

        # Check attempts
        attempts = self.redis.get(attempts_key)
        attempts_count = int(attempts) if attempts else 0
        
        if attempts_count >= self.max_attempts:
            self.redis.delete(otp_key) # Force expire on too many attempts
            logger.warning(f"Max attempts reached for email: {email}")
            return False, "Too many failed attempts. Please request a new code."

        # Verify hash
        if not verify_password(otp, hashed_otp):
            self.redis.incr(attempts_key)
            self.redis.expire(attempts_key, self.otp_ttl)
            return False, "Invalid or expired code"

        # Success - Cleanup
        self.redis.delete(otp_key)
        self.redis.delete(attempts_key)
        self.redis.delete(self._get_cooldown_key(email))
        
        logger.info(f"OTP successfully verified for email: {email}")
        return True, "Verification successful"

otp_service = OTPService()
