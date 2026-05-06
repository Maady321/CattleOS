from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.validation import PayloadSizeLimitMiddleware
import logging

from app.core.middleware import SecureHeadersMiddleware, ObservabilityMiddleware
from app.core.logging import setup_logging
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from prometheus_fastapi_instrumentator import Instrumentator

# 1. Initialize Structured Logging
setup_logging()

# 2. Initialize Sentry
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[
            StarletteIntegration(),
            FastApiIntegration(),
            SqlalchemyIntegration(),
            RedisIntegration(),
        ],
        environment=settings.ENVIRONMENT,
        traces_sample_rate=1.0 if settings.ENVIRONMENT == "development" else 0.1,
        profiles_sample_rate=1.0 if settings.ENVIRONMENT == "development" else 0.1,
        send_default_pii=True
    )

logger = logging.getLogger("app.main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.ENVIRONMENT == "development" else None,
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    description="CattleOS Production API",
    version="1.0.0",
    debug=settings.DEBUG
)

# 1. Custom Exception Handlers for Safe Error Responses
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error: {str(exc)} from {request.client.host}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Invalid request parameters", "code": "VALIDATION_ERROR"},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error. Please try again later."},
    )

# 3. Add Middlewares (Order: Last added is first executed)
app.add_middleware(ObservabilityMiddleware)
app.add_middleware(SecureHeadersMiddleware)
app.add_middleware(PayloadSizeLimitMiddleware, max_size=5 * 1024 * 1024)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

# 4. Initialize Prometheus Instrumentator
if settings.ENABLE_METRICS:
    Instrumentator().instrument(app).expose(app, endpoint="/metrics", tags=["monitoring"])

@app.get("/")
def root():
    return {"message": "Welcome to CattleOS API", "status": "healthy"}
