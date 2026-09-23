# src/advocatediary/config.py

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


current_file = Path(__file__).resolve()

DB_NAME = "diary.db"

BASE_DIR = current_file.parents[2]         
BACKEND_DIR = BASE_DIR / "src" / "advocatediarysystem"
FRONTEND_DIR = BASE_DIR / "src" / "frontend"

DB_PATH = BASE_DIR / "database" / DB_NAME 
LOG_PATH = BACKEND_DIR / "logs" / "logs.log"


class Settings(BaseSettings):
    DATABASE_URL: str = f"sqlite:///{DB_PATH}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instantiate the settings
settings = Settings()
