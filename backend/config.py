"""
FX-Master Application Configuration
Centralized settings loaded from environment variables.
"""

from pydantic_settings import BaseSettings
from typing import List
from cryptography.fernet import Fernet
import json


class Settings(BaseSettings):
    # --- Application ---
    APP_NAME: str = "FX-Master"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production"
    API_PREFIX: str = "/api/v1"

    # --- Database (SQLite for dev, PostgreSQL for prod) ---
    DATABASE_URL: str = "sqlite+aiosqlite:///./fxmaster_dev.db"

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- JWT ---
    JWT_SECRET_KEY: str = "fxmaster-dev-jwt-secret-key-2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- Encryption ---
    ENCRYPTION_KEY: str = ""

    # --- OANDA ---
    OANDA_DEMO_URL: str = "https://api-fxpractice.oanda.com"
    OANDA_LIVE_URL: str = "https://api-fxtrade.oanda.com"
    OANDA_STREAM_DEMO_URL: str = "https://stream-fxpractice.oanda.com"
    OANDA_STREAM_LIVE_URL: str = "https://stream-fxtrade.oanda.com"

    # --- CORS ---
    CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'

    # --- Rate Limiting ---
    RATE_LIMIT_PER_MINUTE: int = 120

    @property
    def cors_origins_list(self) -> List[str]:
        return json.loads(self.CORS_ORIGINS)

    def get_encryption_key(self) -> str:
        """Get or auto-generate a Fernet key for dev."""
        if self.ENCRYPTION_KEY:
            return self.ENCRYPTION_KEY
        # Auto-generate a stable dev key (from SECRET_KEY deterministically)
        import hashlib, base64
        key_bytes = hashlib.sha256(self.SECRET_KEY.encode()).digest()
        return base64.urlsafe_b64encode(key_bytes).decode()

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
