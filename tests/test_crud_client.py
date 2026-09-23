import pytest
from advocatediarysystem.crud import client as crud_client
from advocatediarysystem.schemas.client import ClientCreate, ClientUpdate

def test_create_client(db_session):
    client_in = ClientCreate(name="Alice", email="alice@example.com", phone="12345", address="123 Street")
    client = crud_client.create_client(db=db_session, client_in=client_in)
    
    assert client.id is not None
    assert client.name == "Alice"
    assert client.email == "alice@example.com"
    assert client.phone == "12345"

def test_get_client_by_id(db_session):
    client_in = ClientCreate(name="Bob", address="123 Street")
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
    crud_client.create_client(db=db_session, client_in=ClientCreate(name="Client 1", address="123 Street"))
    crud_client.create_client(db=db_session, client_in=ClientCreate(name="Client 2", address="123 Street"))
    crud_client.create_client(db=db_session, client_in=ClientCreate(name="Client 3", address="123 Street"))
    
    clients = crud_client.get_clients(db=db_session, skip=0, limit=10)
    assert len(clients) == 3
    
    clients_limited = crud_client.get_clients(db=db_session, skip=0, limit=2)
    assert len(clients_limited) == 2

def test_update_client(db_session):
    client_in = ClientCreate(name="Charlie", email="charlie@old.com", address="123 Street")
    created_client = crud_client.create_client(db=db_session, client_in=client_in)
    
    update_data = ClientUpdate(email="charlie@new.com", phone="999")
    db_client = crud_client.get_client_by_id(db=db_session, client_id=created_client.id)
    updated_client = crud_client.update_client(db=db_session, db_client=db_client, client_in=update_data)
    
    assert updated_client is not None
    assert updated_client.id == created_client.id
    assert updated_client.name == "Charlie" # Unchanged
    assert updated_client.email == "charlie@new.com" # Updated
    assert updated_client.phone == "999" # Updated

def test_delete_client(db_session):
    client_in = ClientCreate(name="Dave", address="123 Street")
    created_client = crud_client.create_client(db=db_session, client_in=client_in)
    
    db_client = crud_client.get_client_by_id(db=db_session, client_id=created_client.id)
    crud_client.delete_client(db=db_session, db_client=db_client)
    
    fetched = crud_client.get_client_by_id(db=db_session, client_id=created_client.id)
    assert fetched is None


def test_get_client_by_phone(db_session):
    client_in = ClientCreate(name="Eve", phone="+919876543210", address="123 Street")
    created_client = crud_client.create_client(db=db_session, client_in=client_in)

    fetched_client = crud_client.get_client_by_phone(db=db_session, phone="+919876543210")
    assert fetched_client is not None
    assert fetched_client.id == created_client.id
    assert fetched_client.name == "Eve"


def test_get_client_by_phone_not_found(db_session):
    fetched_client = crud_client.get_client_by_phone(db=db_session, phone="0000000000")
    assert fetched_client is None
