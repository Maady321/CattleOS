from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response
import time
import uuid
import logging
from app.core.config import settings
from app.core.logging import correlation_id_ctx
from app.core.metrics import metrics_manager
import sentry_sdk

logger = logging.getLogger("app.middleware")

class SecureHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        # 1. HSTS (Strict-Transport-Security)
        # 2 years = 63072000 seconds
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        
        # 2. X-Content-Type-Options: Prevent MIME sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # 3. X-Frame-Options: Prevent Clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # 4. X-XSS-Protection
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # 5. Content-Security-Policy (CSP)
        # Tighten this based on your frontend needs
        csp = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline' fonts.googleapis.com; "
            "font-src 'self' fonts.gstatic.com; "
            "img-src 'self' data:; "
            "connect-src 'self'; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        response.headers["Content-Security-Policy"] = csp
        
        # 6. Referrer-Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # 7. Permissions-Policy
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response

class ObservabilityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Start timer for metrics
        start_time = time.time()
        
        # 2. Get or create Correlation ID
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        token = correlation_id_ctx.set(correlation_id)
        
        # 3. Set Sentry context
        with sentry_sdk.configure_scope() as scope:
            scope.set_tag("correlation_id", correlation_id)
            if hasattr(request.state, "user_id"):
                scope.set_user({"id": str(request.state.user_id)})

        try:
            response: Response = await call_next(request)
            
            # 4. Record latency
            duration = time.time() - start_time
            metrics_manager.record_api_latency(
                method=request.method,
                endpoint=request.url.path,
                duration=duration
            )
            
            # 5. Add correlation ID to response headers
            response.headers["X-Correlation-ID"] = correlation_id
            return response
            
        except Exception as e:
            # Sentry will catch this automatically if initialized
            logger.exception(f"Unhandled error in request: {str(e)}")
            raise
        finally:
            correlation_id_ctx.reset(token)
