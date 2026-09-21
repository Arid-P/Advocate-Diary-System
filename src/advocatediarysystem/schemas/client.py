from datetime import datetime
from pydantic import BaseModel, ConfigDict


# 1. Base schema (shared fields)
#Just initialise the manadatorty values, and for optional ones equate to None
class ClientBase(BaseModel):
    name: str
    phone: str | None = None
    email: str | None = None
    address: str


# 2. Schema for creating a client (POST) (C in  CRUD)
class ClientCreate(ClientBase):
    pass


# 3. Schema for updating a client (PATCH)
class ClientUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None


# 4. Schema for returning a client (GET)
class ClientRead(ClientBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)