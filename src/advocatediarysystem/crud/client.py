# src/advocatediarysystem/crud/client.py

from sqlalchemy import select
from sqlalchemy.orm import Session

from advocatediarysystem.models.client import Client
from advocatediarysystem.schemas.client import ClientCreate, ClientUpdate
from advocatediarysystem.utils.logger import setup_logger

logger = setup_logger("crud.client")


def create_client(db: Session, client_in: ClientCreate) -> Client:
    new_client: Client = Client(**client_in.model_dump(exclude_unset=True))

    db.add(new_client)
    db.commit()
    db.refresh(new_client)

    logger.info(f"Created a new client with ID: {new_client.id}")
    return new_client


def get_client_by_id(db: Session, client_id: int) -> Client | None:
    logger.info(f"Trying to fetch a client with id: {client_id}")

    query = select(Client).where(Client.id == client_id)
    client = db.scalar(query)

    if client:
        logger.info(f"Fetched the client.")
    else:
        logger.info(f"No such client exists in database.")
    return client


def get_client_by_phone(db: Session, phone: str) -> Client | None:
    logger.info(f"Trying to fetch a client with phone: {phone}")

    query = select(Client).where(Client.phone == phone)
    client = db.scalar(query)

    if client:
        logger.info("Fetched the client by phone.")
    else:
        logger.info("No such client exists in database with this phone.")
    return client


def get_clients(db: Session, skip: int = 0, limit: int = 100) -> list[Client]:
    query = select(Client).offset(skip).limit(limit)
    clients = list(db.scalars(query).all())

    logger.info(f"Fetched {limit} clients starting with the {skip+1}th one")
    return clients


def update_client(db: Session, db_client: Client, client_in: ClientUpdate) -> Client:
    logger.warning(f"Trying to update the client with id: {db_client.id}")

    update_data = client_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_client, field, value)
    
    db.commit()
    db.refresh(db_client)

    logger.info(f"Updated the client's informartion in the database.")
    return db_client


def delete_client(db: Session, db_client: Client) -> None:
    logger.warning(f"Trying to delete the client with id: {db_client.id}")

    db.delete(db_client)
    db.commit()

    logger.info(f"The client's record is deleted")
