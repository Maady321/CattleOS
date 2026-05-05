import bleach
import os
import logging
from typing import Annotated, Any
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel, ConfigDict, field_validator, AfterValidator
from werkzeug.utils import secure_filename

logger = logging.getLogger("security.validation")

# 1. Anti-XSS Sanitization
def sanitize_string(v: Any) -> Any:
    if isinstance(v, str):
        # Strip all tags by default for strict security
        return bleach.clean(v, tags=[], attributes={}, strip=True)
    return v

# Reusable XSS Protected String Type
SanitizedStr = Annotated[str, AfterValidator(sanitize_string)]

# 2. Strict Pydantic Base Schema
class SecureBaseModel(BaseModel):
    model_config = ConfigDict(
        extra="forbid",       # Reject unknown fields
        strict=True,          # Enforce strict type checking
        str_strip_whitespace=True,
        validate_assignment=True
    )

# 3. Payload Size Limit Middleware
class PayloadSizeLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_size: int = 10 * 1024 * 1024): # Default 10MB
        super().__init__(app)
        self.max_size = max_size

    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("Content-Length")
        if content_length:
            if int(content_length) > self.max_size:
                logger.warning(f"Payload size limit exceeded from {request.client.host}")
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="Payload too large"
                )
        return await call_next(request)

# 4. File Validation Helpers
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf", ".csv"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "application/pdf", "text/csv"}

def validate_file(filename: str, content_type: str, size: int, max_size: int = 5 * 1024 * 1024):
    """
    Validates filename, extension, MIME type, and size.
    """
    # 1. Sanitize filename
    safe_name = secure_filename(filename)
    if not safe_name:
        raise HTTPException(status_code=400, detail="Invalid filename")

    # 2. Check Extension
    _, ext = os.path.splitext(safe_name.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File extension {ext} not allowed")

    # 3. Check MIME Type
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type")

    # 4. Check Size
    if size > max_size:
        raise HTTPException(status_code=413, detail="File too large")

    return safe_name
