import pytest
from advocatediarysystem.crud import client as crud_client
from advocatediarysystem.crud import case as crud_case
from advocatediarysystem.schemas.client import ClientCreate
from advocatediarysystem.schemas.case import CaseCreate, CaseUpdate
from advocatediarysystem.models.case import CaseStatus

@pytest.fixture
def test_client(db_session):
    return crud_client.create_client(db=db_session, client_in=ClientCreate(name="Case Client", address="123 Street"))

def test_create_case(db_session, test_client):
    case_in = CaseCreate(title="Test Case", description="Desc", client_id=test_client.id, case_number="CAS-123", court="High Court", opposite_party="State")
    case = crud_case.create_case(db=db_session, case_in=case_in)
    
    assert case.id is not None
    assert case.title == "Test Case"
    assert case.status == CaseStatus.OPEN
    assert case.client_id == test_client.id

def test_get_case_by_id(db_session, test_client):
    case_in = CaseCreate(title="Get Case", client_id=test_client.id, case_number="CAS-123", court="High Court", opposite_party="State")
    created_case = crud_case.create_case(db=db_session, case_in=case_in)
    
    fetched = crud_case.get_case_by_id(db=db_session, case_id=created_case.id)
    assert fetched is not None
    assert fetched.title == "Get Case"

def test_get_cases_by_client(db_session, test_client):
    crud_case.create_case(db=db_session, case_in=CaseCreate(title="Case 1", client_id=test_client.id, case_number="CAS-123", court="High Court", opposite_party="State"))
    crud_case.create_case(db=db_session, case_in=CaseCreate(title="Case 2", client_id=test_client.id, case_number="CAS-123", court="High Court", opposite_party="State"))
    
    other_client = crud_client.create_client(db=db_session, client_in=ClientCreate(name="Other", address="123 Street"))
    crud_case.create_case(db=db_session, case_in=CaseCreate(title="Other Case", client_id=other_client.id, case_number="CAS-123", court="High Court", opposite_party="State"))
    
    client_cases = crud_case.get_cases_by_client(db=db_session, client_id=test_client.id)
    assert len(client_cases) == 2
    assert all(c.client_id == test_client.id for c in client_cases)

def test_update_case(db_session, test_client):
    created_case = crud_case.create_case(db=db_session, case_in=CaseCreate(title="Old Title", client_id=test_client.id, case_number="CAS-123", court="High Court", opposite_party="State"))
    
    update_data = CaseUpdate(title="New Title", status=CaseStatus.CLOSED)
    updated = crud_case.update_case(db=db_session, case_id=created_case.id, case_in=update_data)
    
    assert updated is not None
    assert updated.title == "New Title"
    assert updated.status == CaseStatus.CLOSED

def test_delete_case(db_session, test_client):
    created_case = crud_case.create_case(db=db_session, case_in=CaseCreate(title="To Delete", client_id=test_client.id, case_number="CAS-123", court="High Court", opposite_party="State"))
    
    deleted = crud_case.delete_case(db=db_session, case_id=created_case.id)
    assert deleted is True
    
    fetched = crud_case.get_case_by_id(db=db_session, case_id=created_case.id)
    assert fetched is None
