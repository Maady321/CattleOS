import logging
import hashlib
import time
from typing import Optional, Tuple
from fastapi import Request, HTTPException, status
from app.core.config import settings
from app.core.redis import redis_client

logger = logging.getLogger("security.abuse")

class SecurityService:
    def __init__(self):
        self.redis = redis_client
        self.max_failures = settings.AUTH_MAX_FAILURES
        self.base_lockout = settings.AUTH_LOCKOUT_DURATION
        self.max_lockout = settings.AUTH_MAX_EXPONENTIAL_LOCKOUT

    def _get_fingerprint(self, request: Request) -> str:
        """
        Generates a unique device fingerprint based on headers.
        """
        user_agent = request.headers.get("user-agent", "unknown")
        accept_lang = request.headers.get("accept-language", "unknown")
        # You could add more headers here for more precision
        fingerprint_data = f"{user_agent}|{accept_lang}"
        return hashlib.sha256(fingerprint_data.encode()).hexdigest()

    def _get_keys(self, identifier: str, ip: str, fingerprint: str) -> list:
        """
        Returns keys for different throttling layers.
        """
        return [
            f"auth_fail:email:{identifier}",
            f"auth_fail:ip:{ip}",
            f"auth_fail:fp:{fingerprint}"
        ]

    def _get_lockout_key(self, key: str) -> str:
        return f"lockout:{key}"

    def _calculate_backoff(self, failure_count: int) -> int:
        """
        Exponential backoff: base_lockout * (2 ^ (cycles))
        Where cycles is floor(failure_count / max_failures)
        """
        cycles = failure_count // self.max_failures
        if cycles == 0:
            return self.base_lockout
        
        # Exponential increase: 15m, 30m, 1h, 2h, 4h... up to max_lockout
        lockout = self.base_lockout * (2 ** (cycles - 1))
        return min(lockout, self.max_lockout)

    async def check_abuse(self, request: Request, identifier: str):
        """
        Checks if the request should be blocked due to existing lockouts.
        """
        ip = request.client.host
        fingerprint = self._get_fingerprint(request)
        keys = self._get_keys(identifier, ip, fingerprint)

        for key in keys:
            lockout_key = self._get_lockout_key(key)
            remaining = self.redis.ttl(lockout_key)
            if remaining > 0:
                logger.warning(
                    f"Blocked request for {identifier} from {ip}. Lockout active for {key}. "
                    f"Remaining: {remaining}s"
                )
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "message": "Too many failed attempts. Account temporarily locked.",
                        "retry_after": remaining
                    }
                )

    async def track_failure(self, request: Request, identifier: str):
        """
        Increments failure counters and applies lockouts if threshold is reached.
        """
        ip = request.client.host
        fingerprint = self._get_fingerprint(request)
        keys = self._get_keys(identifier, ip, fingerprint)

        for key in keys:
            count = self.redis.incr(key)
            # Set expiration if new counter (1 day window to track repeated failures)
            if count == 1:
                self.redis.expire(key, 86400)

            if count % self.max_failures == 0:
                lockout_duration = self._calculate_backoff(count)
                lockout_key = self._get_lockout_key(key)
                self.redis.setex(lockout_key, lockout_duration, "locked")
                
                logger.error(
                    f"LOCKOUT triggered for {key}. Identifier: {identifier}, IP: {ip}. "
                    f"Duration: {lockout_duration}s. Total failures: {count}"
                )

    async def reset_failures(self, request: Request, identifier: str):
        """
        Clears failure counters upon successful authentication.
        Note: Lockouts usually stay until they expire, but counters are reset.
        """
        ip = request.client.host
        fingerprint = self._get_fingerprint(request)
        keys = self._get_keys(identifier, ip, fingerprint)
        
        for key in keys:
            self.redis.delete(key)
        
        logger.info(f"Authentication success for {identifier}. Counters reset.")

    def admin_unlock(self, identifier: str = None, ip: str = None):
        """
        Manually unlock an identifier or IP.
        """
        if identifier:
            self.redis.delete(f"auth_fail:email:{identifier}")
            self.redis.delete(f"lockout:auth_fail:email:{identifier}")
        if ip:
            self.redis.delete(f"auth_fail:ip:{ip}")
            self.redis.delete(f"lockout:auth_fail:ip:{ip}")
        
        logger.info(f"Admin manually unlocked Identifier: {identifier}, IP: {ip}")

security_service = SecurityService()
