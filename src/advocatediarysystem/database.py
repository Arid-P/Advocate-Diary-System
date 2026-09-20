from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from typing import Generator

from advocatediarysystem.config import settings

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(
    autoflush=False,
    autocommit=False,
    bind=engine
)

class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    """Get a session using SessionLocal to provide acess to the database."""
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()