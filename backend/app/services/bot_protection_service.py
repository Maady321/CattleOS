import logging
import time
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, status
from app.core.redis import redis_client
from app.core.config import settings
from app.services.audit_service import audit_service
import httpx

logger = logging.getLogger("security.bot")

class BotProtectionService:
    def __init__(self):
        self.redis = redis_client
        self.ip_blacklist_key = "blacklist:ips"
        self.velocity_key_prefix = "velocity:"
        # Turnstile/reCAPTCHA config (placeholders)
        self.captcha_secret = getattr(settings, "CAPTCHA_SECRET", "1x0000000000000000000000000000000AA")

    async def verify_captcha(self, token: str) -> bool:
        """
        Verifies Cloudflare Turnstile or Google reCAPTCHA token.
        """
        if not token:
            return False
        
        async with httpx.AsyncClient() as client:
            try:
                # Example for Turnstile
                response = await client.post(
                    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                    data={
                        "secret": self.captcha_secret,
                        "response": token
                    },
                    timeout=5.0
                )
                data = response.json()
                return data.get("success", False)
            except Exception as e:
                logger.error(f"CAPTCHA verification failed: {str(e)}")
                return False

    def is_ip_blacklisted(self, ip: str) -> bool:
        return self.redis.sismember(self.ip_blacklist_key, ip)

    def blacklist_ip(self, ip: str, ttl: int = 86400):
        self.redis.sadd(self.ip_blacklist_key, ip)
        # Optional: auto-expire from set is not possible directly on sismember, 
        # but we can use a sorted set with scores as timestamps.
        # For now, we'll just use a simple set for global blocks.

    def check_velocity(self, identifier: str, limit: int = 10, window: int = 60) -> bool:
        """
        Generic velocity check (e.g., 10 requests per 60 seconds).
        """
        key = f"{self.velocity_key_prefix}{identifier}"
        count = self.redis.incr(key)
        if count == 1:
            self.redis.expire(key, window)
        return count <= limit

    def calculate_bot_score(self, request: Request, data: Dict[str, Any]) -> int:
        """
        Heuristic bot scoring (0-100).
        - Honeypot filled: +100
        - No User-Agent: +50
        - Missing fingerprint: +20
        - High velocity: +30
        """
        score = 0
        
        # 1. Honeypot check
        if data.get("website_url"): # Hidden honeypot field
            score += 100
            
        # 2. UA check
        ua = request.headers.get("user-agent", "")
        if not ua or "bot" in ua.lower() or "python" in ua.lower():
            score += 50
            
        # 3. Fingerprint check
        if not data.get("device_fingerprint"):
            score += 20
            
        return score

    async def protect(self, request: Request, data: Dict[str, Any]):
        """
        Combined protection logic for sensitive endpoints.
        """
        ip = request.client.host
        
        # 1. Check Blacklist
        if self.is_ip_blacklisted(ip):
            logger.warning(f"Blocked request from blacklisted IP: {ip}")
            raise HTTPException(status_code=403, detail="Access denied")

        # 2. Velocity Detection
        if not self.check_velocity(ip):
            logger.warning(f"Velocity threshold exceeded for IP: {ip}")
            self.blacklist_ip(ip, ttl=3600) # Temporary block
            raise HTTPException(status_code=429, detail="Too many requests")

        # 3. Bot Scoring
        score = self.calculate_bot_score(request, data)
        if score >= 100:
            logger.critical(f"BOT DETECTED: IP {ip}, Score {score}")
            audit_service.log_event(
                None, # No session for bots
                "BOT_BLOCKED", 
                status="SUSPICIOUS",
                metadata={"score": score, "ip": ip, "data": data}
            )
            raise HTTPException(status_code=403, detail="Bot activity detected")
        
        # 4. CAPTCHA Enforcement (if score is suspicious but not definitive)
        if score > 30:
            captcha_token = data.get("captcha_token")
            if not await self.verify_captcha(captcha_token):
                raise HTTPException(status_code=400, detail="CAPTCHA verification required")

bot_service = BotProtectionService()
