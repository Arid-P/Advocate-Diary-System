import pytest
from datetime import datetime, timezone
from advocatediarysystem.crud import client as crud_client
from advocatediarysystem.crud import case as crud_case
from advocatediarysystem.crud import hearing as crud_hearing
from advocatediarysystem.schemas.client import ClientCreate
from advocatediarysystem.schemas.case import CaseCreate
from advocatediarysystem.schemas.hearing import HearingCreate, HearingUpdate

@pytest.fixture
def test_case(db_session):
    client = crud_client.create_client(db=db_session, client_in=ClientCreate(name="Hearing Client", address="123 Street"))
    return crud_case.create_case(db=db_session, case_in=CaseCreate(title="Hearing Case", client_id=client.id, case_number="CAS-123", court="High Court", opposite_party="State"))

def test_create_hearing(db_session, test_case):
    now = datetime.now(timezone.utc)
    hearing_in = HearingCreate(hearing_date=now, case_id=test_case.id, summary="First Hearing", stage="Initial")
    hearing = crud_hearing.create_hearing(db=db_session, hearing_in=hearing_in)
    
    assert hearing.id is not None
    assert hearing.hearing_date == now
    assert hearing.summary == "First Hearing"
    assert hearing.case_id == test_case.id

def test_get_hearings_by_case(db_session, test_case):
    now = datetime.now(timezone.utc)
    crud_hearing.create_hearing(db=db_session, hearing_in=HearingCreate(hearing_date=now, case_id=test_case.id, stage="Initial"))
    crud_hearing.create_hearing(db=db_session, hearing_in=HearingCreate(hearing_date=now, case_id=test_case.id, stage="Initial"))
    
    hearings = crud_hearing.get_hearings_by_case(db=db_session, case_id=test_case.id)
    assert len(hearings) == 2
    assert all(h.case_id == test_case.id for h in hearings)

def test_update_hearing(db_session, test_case):
    now = datetime.now(timezone.utc)
    created = crud_hearing.create_hearing(db=db_session, hearing_in=HearingCreate(hearing_date=now, case_id=test_case.id, stage="Initial"))
    
    update_data = HearingUpdate(summary="Updated notes")
    updated = crud_hearing.update_hearing(db=db_session, hearing_id=created.id, hearing_in=update_data)
    
    assert updated is not None
    assert updated.summary == "Updated notes"
    assert updated.hearing_date == now # Remains unchanged

def test_delete_hearing(db_session, test_case):
    now = datetime.now(timezone.utc)
    created = crud_hearing.create_hearing(db=db_session, hearing_in=HearingCreate(hearing_date=now, case_id=test_case.id, stage="Initial"))
    
    deleted = crud_hearing.delete_hearing(db=db_session, hearing_id=created.id)
    assert deleted is True
    
    fetched = crud_hearing.get_hearing_by_id(db=db_session, hearing_id=created.id)
    assert fetched is None
