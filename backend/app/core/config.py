from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Art-Nuggets Application"
    DEBUG: bool = False
    VERSION: str = "1.0.0"

    # Database
    DATABASE_URL: str
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""

    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Groq API
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "qwen/qwen3-32b"  # Qwen3 32B model on Groq

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Parse CORS_ORIGINS from environment if provided as string
        cors_origins_env = os.getenv("CORS_ORIGINS")
        if cors_origins_env:
            # Support JSON array format: ["url1", "url2"]
            import json

            try:
                self.CORS_ORIGINS = json.loads(cors_origins_env)
            except json.JSONDecodeError:
                # Fallback: comma-separated string
                self.CORS_ORIGINS = [
                    origin.strip() for origin in cors_origins_env.split(",")
                ]


settings = Settings()
