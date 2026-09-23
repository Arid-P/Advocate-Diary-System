from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AdvocateBase(BaseModel):
    name: str
    enrollment_number: str
    email: str
    phone: str
    chamber_address: str


class AdvocateCreate(AdvocateBase):
    password: str


class AdvocateLogin(BaseModel):
    identifier: str
    password: str


class AdvocateRead(AdvocateBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
