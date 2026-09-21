from datetime import datetime
from pydantic import BaseModel, ConfigDict


class HearingBase(BaseModel):
    hearing_date: datetime
    next_hearing_date: datetime | None = None

    stage: str
    summary: str | None = None
    case_id: int



class HearingCreate(HearingBase):
    pass


class HearingUpdate(BaseModel):
    hearing_date: datetime | None = None
    next_hearing_date: datetime | None = None

    stage: str | None = None
    summary: str | None = None
    case_id: int | None = None


class HearingRead(HearingBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)