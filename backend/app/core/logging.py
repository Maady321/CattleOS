import logging
import sys
import uuid
from typing import Any, Dict
from pythonjsonlogger import jsonlogger
from app.core.config import settings
import contextvars

# Context variable to store correlation ID
correlation_id_ctx = contextvars.ContextVar("correlation_id", default=None)

class CorrelationIdFilter(logging.Filter):
    def filter(self, record):
        record.correlation_id = correlation_id_ctx.get()
        return True

class SensitiveDataFilter(logging.Filter):
    SENSITIVE_KEYS = {"password", "token", "secret", "key", "otp", "authorization"}

    def filter(self, record):
        if hasattr(record, "msg") and isinstance(record.msg, str):
            # Mask common patterns
            record.msg = self.mask_secrets(record.msg)
        if hasattr(record, "args") and record.args:
            record.args = tuple(self.mask_secrets(str(arg)) for arg in record.args)
        return True

    def mask_secrets(self, text: str) -> str:
        # Simple masking logic for demo; in production use more robust regex
        lowered = text.lower()
        for key in self.SENSITIVE_KEYS:
            if key in lowered:
                return "[MASKED]"
        return text

def setup_logging():
    log_handler = logging.StreamHandler(sys.stdout)
    
    # Define the fields we want in our JSON logs
    format_str = "%(asctime)s %(levelname)s %(name)s %(message)s %(correlation_id)s %(filename)s %(lineno)d"
    
    formatter = jsonlogger.JsonFormatter(format_str)
    log_handler.setFormatter(formatter)
    
    root_logger = logging.getLogger()
    root_logger.addHandler(log_handler)
    root_logger.setLevel(settings.LOG_LEVEL)
    
    # Add filters
    for handler in root_logger.handlers:
        handler.addFilter(CorrelationIdFilter())
        handler.addFilter(SensitiveDataFilter())

    # Suppress verbose loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

def get_logger(name: str):
    return logging.getLogger(name)
