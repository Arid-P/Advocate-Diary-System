import os
import pytest
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from advocatediarysystem.database import Base
from advocatediarysystem.config import settings

# Override the database path for tests
TEST_DB_NAME = "test.db"
TEST_DB_PATH = settings.BASE_DIR / "database" / TEST_DB_NAME
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_PATH}"

# Create the test engine
engine = create_engine(
    TEST_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    echo=False # Keep output clean during tests
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def setup_database():
    """
    Session-wide fixture that creates and drops the test database.
    """
    # Ensure database directory exists
    TEST_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    # Create all tables in test database
    Base.metadata.create_all(bind=engine)
    
    yield  # Run the tests
    
    # Teardown: drop tables and optionally remove the test db file
    Base.metadata.drop_all(bind=engine)
    if TEST_DB_PATH.exists():
        os.remove(TEST_DB_PATH)

@pytest.fixture(scope="function")
def db_session(setup_database):
    """
    Function-scoped fixture to provide a fresh database session for each test.
    We clear all data before each test to ensure total isolation.
    """
    # Drop and recreate all tables for a clean slate per test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
