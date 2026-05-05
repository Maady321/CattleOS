from typing import List, Optional, Union, Any
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CattleOS"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str # No default, must be in .env
    OLD_SECRET_KEY: Optional[str] = None # For rotation
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    ENVIRONMENT: str = "production" # development, production, test
    DEBUG: bool = False
    
    # Cookie Settings
    SECURE_COOKIE: bool = True
    COOKIE_DOMAIN: Optional[str] = None
    COOKIE_SAMESITE: str = "lax"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [] # List of strings from .env
    
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "cattleos"
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: dict) -> Any:
        if isinstance(v, str):
            return v
        return f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_SERVER')}/{values.get('POSTGRES_DB')}"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    # OTP Settings
    OTP_TTL: int = 300  # 5 minutes
    OTP_MAX_ATTEMPTS: int = 5
    OTP_RESEND_COOLDOWN: int = 60  # 60 seconds
    OTP_RATE_LIMIT_WINDOW: int = 3600  # 1 hour
    OTP_RATE_LIMIT_MAX_REQUESTS: int = 10  # max 10 OTPs per hour

    # Brute-force Protection
    AUTH_MAX_FAILURES: int = 5
    AUTH_LOCKOUT_DURATION: int = 900  # 15 minutes
    AUTH_MAX_EXPONENTIAL_LOCKOUT: int = 86400  # 24 hours

    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SENDER_EMAIL: Optional[str] = None

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
