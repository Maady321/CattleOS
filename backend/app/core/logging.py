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

def setup_logging():
    log_handler = logging.StreamHandler(sys.stdout)
    
    # Define the fields we want in our JSON logs
    format_str = "%(asctime)s %(levelname)s %(name)s %(message)s %(correlation_id)s %(filename)s %(lineno)d"
    
    formatter = jsonlogger.JsonFormatter(format_str)
    log_handler.setFormatter(formatter)
    
    root_logger = logging.getLogger()
    root_logger.addHandler(log_handler)
    root_logger.setLevel(settings.LOG_LEVEL)
    
    # Add correlation ID filter to all handlers
    for handler in root_logger.handlers:
        handler.addFilter(CorrelationIdFilter())

    # Suppress verbose loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

def get_logger(name: str):
    return logging.getLogger(name)
