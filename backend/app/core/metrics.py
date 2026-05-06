from prometheus_client import Counter, Histogram, Gauge
import time

# 1. Auth Metrics
AUTH_ATTEMPTS = Counter(
    "auth_attempts_total", "Total number of auth attempts", ["method", "status"]
)
OTP_SENT = Counter("otp_sent_total", "Total number of OTPs sent", ["status"])
OTP_VERIFICATION = Counter(
    "otp_verification_total", "OTP verification results", ["status"]
)

# 2. Security Metrics
RBAC_DENIALS = Counter(
    "rbac_denials_total", "Total number of RBAC permission denials", ["role", "resource"]
)
IDOR_ATTEMPTS = Counter("idor_attempts_total", "Potential IDOR attempts detected")
SESSION_COMPROMISED = Counter(
    "session_compromised_total", "Refresh token replay detections"
)
BOT_BLOCKED = Counter("bot_blocked_total", "Requests blocked by bot protection")

# 3. Performance Metrics
API_REQUEST_LATENCY = Histogram(
    "api_request_duration_seconds", "API request latency", ["method", "endpoint"]
)
DB_QUERY_DURATION = Histogram(
    "db_query_duration_seconds", "Database query duration", ["operation", "table"]
)
REDIS_LATENCY = Histogram(
    "redis_operation_duration_seconds", "Redis operation latency", ["operation"]
)

# 4. Infrastructure Metrics
REDIS_ERRORS = Counter("redis_errors_total", "Total number of Redis connection errors")
DB_ERRORS = Counter("db_errors_total", "Total number of Database errors")

class MetricsManager:
    @staticmethod
    def track_auth(method: str, status: str):
        AUTH_ATTEMPTS.labels(method=method, status=status).inc()

    @staticmethod
    def track_rbac_denial(role: str, resource: str):
        RBAC_DENIALS.labels(role=role, resource=resource).inc()

    @staticmethod
    def track_redis_error():
        REDIS_ERRORS.inc()

    @staticmethod
    def record_api_latency(method: str, endpoint: str, duration: float):
        API_REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(duration)

metrics_manager = MetricsManager()
