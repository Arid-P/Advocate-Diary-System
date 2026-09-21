from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum as SQLEnum
from enum import Enum

from advocatediarysystem.database import Base

#Note: To prevent circular imports
if TYPE_CHECKING:
    from .client import Client
    from .hearing import Hearing
    

class CaseStatus(Enum):
    PENDING = "pending"
    OPEN = "open"
    CLOSED = "closed"
    

class Case(Base):
    __tablename__ = "cases"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    case_number: Mapped[str] = mapped_column(String(50), nullable=False)

    title: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    court: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(
        SQLEnum(CaseStatus), 
        default=CaseStatus.OPEN, 
        nullable=False)

    client_id: Mapped[int] = mapped_column(ForeignKey("clients.id", ondelete="Cascade"), nullable=False)
    client: Mapped["Client"] = relationship(back_populates="cases")

    opposite_party: Mapped[str] = mapped_column(String(100), nullable=False)

    hearings: Mapped[list["Hearing"]] = relationship(
        back_populates="case",
        cascade="all, delete-orphan"
    ) 

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )