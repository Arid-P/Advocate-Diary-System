from typing import TYPE_CHECKING
from datetime import date, datetime, timezone

from sqlalchemy import String, DateTime, Text, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from advocatediarysystem.database import Base

if TYPE_CHECKING:
    from .case import Case

class Hearing(Base):
    __tablename__ = "hearings"

    id:  Mapped[int] = mapped_column(primary_key=True, index=True)
    hearing_date: Mapped[date] = mapped_column(Date, nullable=False)

    stage: Mapped[str] = mapped_column(String(50), nullable=False)
    summary: Mapped[str | None] = mapped_column(Text)

    next_hearing_date: Mapped[date | None] = mapped_column(Date)

    case_id: Mapped[int] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"))
    case: Mapped["Case"] = relationship(back_populates="hearings")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default= lambda: datetime.now(timezone.utc),
        nullable=False
    ) 