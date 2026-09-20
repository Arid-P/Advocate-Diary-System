# src/advocatediary/config.py

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


current_file = Path(__file__).resolve()

BASE_DIR = current_file.parents[2]          
DB_PATH = BASE_DIR / "database" / "diary.db" 
# print(f"{BASE_DIR = }\n{DB_PATH = }")

class Settings(BaseSettings):
    DATABASE_URL: str = f"sqlite:///{DB_PATH}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instantiate the settings
settings = Settings()
