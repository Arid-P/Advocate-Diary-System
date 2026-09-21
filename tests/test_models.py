import pytest
from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select

from advocatediarysystem.models.client import Client
from advocatediarysystem.models.case import Case, CaseStatus
from advocatediarysystem.models.hearing import Hearing

def test_create_client(db_session):
    client = Client(name="John Doe", email="john@example.com", phone="1234567890")
    db_session.add(client)
    db_session.commit()
    db_session.refresh(client)

    assert client.id is not None
    assert client.name == "John Doe"
    assert client.created_at is not None
    assert client.updated_at is not None

def test_create_case(db_session):
    client = Client(name="John Doe")
    db_session.add(client)
    db_session.commit()

    case = Case(
        title="State vs John", 
        description="Criminal case",
        status=CaseStatus.OPEN,
        client_id=client.id
    )
    db_session.add(case)
    db_session.commit()
    db_session.refresh(case)

    assert case.id is not None
    assert case.status == CaseStatus.OPEN
    assert case.client_id == client.id
    assert case.client.name == "John Doe"
    assert len(client.cases) == 1
    assert client.cases[0].title == "State vs John"

def test_create_hearing(db_session):
    client = Client(name="John Doe")
    db_session.add(client)
    db_session.commit()

    case = Case(title="State vs John", client_id=client.id)
    db_session.add(case)
    db_session.commit()

    hearing_date = datetime.now(timezone.utc)
    hearing = Hearing(
        date=hearing_date,
        notes="First hearing",
        case_id=case.id
    )
    db_session.add(hearing)
    db_session.commit()
    db_session.refresh(hearing)

    assert hearing.id is not None
    assert hearing.date == hearing_date
    assert hearing.case_id == case.id
    assert hearing.case.title == "State vs John"
    assert len(case.hearings) == 1
    
def test_case_status_enum(db_session):
    # Test setting enum directly
    client = Client(name="John Doe")
    db_session.add(client)
    db_session.commit()

    case = Case(title="State vs John", status=CaseStatus.CLOSED, client_id=client.id)
    db_session.add(case)
    db_session.commit()
    db_session.refresh(case)
    
    assert case.status == CaseStatus.CLOSED

    # Test that invalid enum fails
    # SQLite typicall doesn't enforce ENUM at the DB level, but SQLAlchemy does at the ORM level
    with pytest.raises(LookupError):
        # We can't even instantiate CaseStatus with wrong value, so we test assigning invalid string
        invalid_case = Case(title="Invalid", status="INVALID_STATUS", client_id=client.id)
        db_session.add(invalid_case)
        db_session.commit()
