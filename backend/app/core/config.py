from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Art-Nuggets Application"
    DEBUG: bool = False
    VERSION: str = "1.0.0"

    # Database
    DATABASE_URL: str
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Groq API
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "qwen/qwen3-32b"  # Qwen3 32B model on Groq

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
