"""
Application configuration using Pydantic Settings.
Reads from environment variables and .env file.
"""

from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, validator


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    app_name: str = Field(default="ContractorConnect", alias="APP_NAME")
    app_version: str = Field(default="1.0.0", alias="APP_VERSION")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    debug: bool = Field(default=True, alias="DEBUG")
    
    # Server
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    
    # Database
    database_url: str = Field(
        default="postgresql://contractor_user:contractor_pass@localhost:5432/contractorconnect_dev",
        alias="DATABASE_URL"
    )
    database_echo: bool = Field(default=False, alias="DATABASE_ECHO")
    
    # Redis
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    
    # Security
    secret_key: str = Field(..., alias="SECRET_KEY")
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=30, alias="REFRESH_TOKEN_EXPIRE_DAYS")
    
    # CORS
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8081"],
        alias="CORS_ORIGINS"
    )
    
    # OTP Configuration
    otp_expire_minutes: int = Field(default=5, alias="OTP_EXPIRE_MINUTES")
    otp_length: int = Field(default=6, alias="OTP_LENGTH")
    max_otp_attempts: int = Field(default=3, alias="MAX_OTP_ATTEMPTS")
    
    # SMS Provider
    sms_provider: str = Field(default="twilio", alias="SMS_PROVIDER")
    sms_api_key: Optional[str] = Field(default=None, alias="SMS_API_KEY")
    sms_api_secret: Optional[str] = Field(default=None, alias="SMS_API_SECRET")
    sms_from_number: Optional[str] = Field(default=None, alias="SMS_FROM_NUMBER")
    
    # Email Configuration
    smtp_host: str = Field(default="smtp.gmail.com", alias="SMTP_HOST")
    smtp_port: int = Field(default=587, alias="SMTP_PORT")
    smtp_user: Optional[str] = Field(default=None, alias="SMTP_USER")
    smtp_password: Optional[str] = Field(default=None, alias="SMTP_PASSWORD")
    smtp_from: str = Field(default="noreply@contractorconnect.com", alias="SMTP_FROM")
    smtp_from_name: str = Field(default="ContractorConnect", alias="SMTP_FROM_NAME")
    
    # File Storage
    storage_type: str = Field(default="local", alias="STORAGE_TYPE")
    aws_access_key_id: Optional[str] = Field(default=None, alias="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: Optional[str] = Field(default=None, alias="AWS_SECRET_ACCESS_KEY")
    aws_region: str = Field(default="ap-south-1", alias="AWS_REGION")
    s3_bucket_name: Optional[str] = Field(default=None, alias="S3_BUCKET_NAME")
    upload_dir: str = Field(default="uploads", alias="UPLOAD_DIR")
    
    # Logging
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    log_file: str = Field(default="logs/app.log", alias="LOG_FILE")
    
    # Rate Limiting
    rate_limit_per_minute: int = Field(default=60, alias="RATE_LIMIT_PER_MINUTE")
    
    # Pagination
    default_page_size: int = Field(default=20, alias="DEFAULT_PAGE_SIZE")
    max_page_size: int = Field(default=100, alias="MAX_PAGE_SIZE")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    @validator("cors_origins", pre=True)
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment.lower() == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment.lower() == "production"


# Create global settings instance
settings = Settings()
