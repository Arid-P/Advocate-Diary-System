import os
import pytest
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from advocatediarysystem.database import Base
from advocatediarysystem.config import BASE_DIR

# Override the database path for tests
TEST_DB_NAME = "test.db"
TEST_DB_PATH = BASE_DIR / "database" / TEST_DB_NAME
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

from fastapi.testclient import TestClient
from advocatediarysystem.main import app
from advocatediarysystem.database import get_db

@pytest.fixture(scope="function")
def client(db_session):
    """
    Test client for FastAPI endpoints.
    Overrides the get_db dependency to use the test database session.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass # DB session is closed by the db_session fixture
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
