import pytest
from advocatediarysystem.crud import client as crud_client
from advocatediarysystem.schemas.client import ClientCreate, ClientUpdate

def test_create_client(db_session):
    client_in = ClientCreate(name="Alice", email="alice@example.com", phone="12345")
    client = crud_client.create_client(db=db_session, client_in=client_in)
    
    assert client.id is not None
    assert client.name == "Alice"
    assert client.email == "alice@example.com"
    assert client.phone == "12345"

def test_get_client_by_id(db_session):
    client_in = ClientCreate(name="Bob")
    created_client = crud_client.create_client(db=db_session, client_in=client_in)
    
    fetched_client = crud_client.get_client_by_id(db=db_session, client_id=created_client.id)
    assert fetched_client is not None
    assert fetched_client.id == created_client.id
    assert fetched_client.name == "Bob"

def test_get_client_by_id_not_found(db_session):
    fetched_client = crud_client.get_client_by_id(db=db_session, client_id=999)
    assert fetched_client is None

def test_get_clients(db_session):
    # Create multiple clients
    crud_client.create_client(db=db_session, client_in=ClientCreate(name="Client 1"))
    crud_client.create_client(db=db_session, client_in=ClientCreate(name="Client 2"))
    crud_client.create_client(db=db_session, client_in=ClientCreate(name="Client 3"))
    
    clients = crud_client.get_clients(db=db_session, skip=0, limit=10)
    assert len(clients) == 3
    
    clients_limited = crud_client.get_clients(db=db_session, skip=0, limit=2)
    assert len(clients_limited) == 2

def test_update_client(db_session):
    client_in = ClientCreate(name="Charlie", email="charlie@old.com")
    created_client = crud_client.create_client(db=db_session, client_in=client_in)
    
    update_data = ClientUpdate(email="charlie@new.com", phone="999")
    updated_client = crud_client.update_client(db=db_session, client_id=created_client.id, client_in=update_data)
    
    assert updated_client is not None
    assert updated_client.id == created_client.id
    assert updated_client.name == "Charlie" # Unchanged
    assert updated_client.email == "charlie@new.com" # Updated
    assert updated_client.phone == "999" # Updated

def test_delete_client(db_session):
    client_in = ClientCreate(name="Dave")
    created_client = crud_client.create_client(db=db_session, client_in=client_in)
    
    deleted = crud_client.delete_client(db=db_session, client_id=created_client.id)
    assert deleted is True
    
    fetched = crud_client.get_client_by_id(db=db_session, client_id=created_client.id)
    assert fetched is None

def test_delete_client_not_found(db_session):
    deleted = crud_client.delete_client(db=db_session, client_id=999)
    assert deleted is False
