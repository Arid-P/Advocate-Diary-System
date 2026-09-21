from datetime import datetime
from pydantic import BaseModel, ConfigDict

from advocatediarysystem.models.case import CaseStatus

class CaseBase(BaseModel):
    case_number: str
    title: str
    description: str | None = None

    court: str
    status: CaseStatus = CaseStatus.OPEN

    opposite_party: str
    client_id: int


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    case_number: str | None = None
    title: str | None = None
    description: str | None = None

    court: str | None = None
    status: CaseStatus | None = None

    opposite_party: str | None = None
    client_id: int | None = None


class CaseRead(CaseBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)