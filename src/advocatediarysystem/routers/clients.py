from uvicorn import run

from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from advocatediarysystem.database import get_db
from advocatediarysystem.schemas import client as client_schemas
from advocatediarysystem.crud import client as client_crud

router = APIRouter(prefix="/clients", tags=["Clients"])


@router.post(
    "/", 
    response_model=client_schemas.ClientRead, 
    status_code=status.HTTP_201_CREATED
)
def create_client(
    client_in: client_schemas.ClientCreate, db: Session = Depends(get_db)
):
    """Create a new client in the database."""
    new_client = client_crud.create_client(db, client_in)
    return new_client


@router.get("/{client_id}", response_model=client_schemas.ClientRead)
def get_client(client_id: int, db: Session = Depends(get_db)):
    """Fetch a specific client by their ID."""
    db_client = client_crud.get_client_by_id(db=db, client_id=client_id)

    if not db_client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with the id {client_id} was not found",
        )

    return db_client


@router.get("/", response_model=list[client_schemas.ClientRead])
def get_clients(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Fetch a list of clients with pagination."""
    clients = client_crud.get_clients(db, skip, limit)
    return clients


@router.patch("/{client_id}", response_model=client_schemas.ClientRead)
def update_client(
    client_id: int,
    client_in: client_schemas.ClientUpdate,
    db: Session = Depends(get_db),
):
    """Update a client's details."""
    db_client = client_crud.get_client_by_id(db=db, client_id=client_id)

    if not db_client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No User with the id {client_id} was found. Hence could not update",
        )

    updated_client = client_crud.update_client(db, db_client, client_in)
    return updated_client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    """Delete a client."""
    db_client = client_crud.get_client_by_id(db=db, client_id=client_id)

    if not db_client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with the id {client_id} was not found, hence could not update.",
        )

    client_crud.delete_client(db, db_client)


if __name__ == "__main__":
    app = FastAPI(title="XYZ")
    app.include_router(router)
    run(app)
