import pytest
from pydantic import ValidationError
from datetime import datetime, timezone

from advocatediarysystem.schemas.client import ClientCreate, ClientUpdate
from advocatediarysystem.schemas.case import CaseCreate, CaseUpdate
from advocatediarysystem.schemas.hearing import HearingCreate, HearingUpdate
from advocatediarysystem.models.case import CaseStatus

def test_client_create_schema():
    # Valid client
    client = ClientCreate(name="John Doe", email="john@example.com")
    assert client.name == "John Doe"
    assert client.email == "john@example.com"
    
    # Missing required field
    with pytest.raises(ValidationError):
        ClientCreate(email="john@example.com") # name is required

def test_client_update_schema():
    # Update schema allows partial updates
    client = ClientUpdate(name="John Updated")
    assert client.name == "John Updated"
    assert client.email is None
    
    # Empty update is valid
    client_empty = ClientUpdate()
    assert client_empty.name is None

def test_case_create_schema():
    # Valid case
    case = CaseCreate(title="State vs John", client_id=1, status=CaseStatus.OPEN)
    assert case.title == "State vs John"
    assert case.client_id == 1
    
    # Default status should be OPEN if not provided
    case2 = CaseCreate(title="State vs John", client_id=1)
    assert case2.status == CaseStatus.OPEN

def test_hearing_create_schema():
    now = datetime.now(timezone.utc)
    # Valid hearing
    hearing = HearingCreate(date=now, case_id=1, notes="First hearing")
    assert hearing.date == now
    assert hearing.case_id == 1
    
    # Missing date
    with pytest.raises(ValidationError):
        HearingCreate(case_id=1)
