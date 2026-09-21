from typing import TYPE_CHECKING
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from advocatediarysystem.database import Base

if TYPE_CHECKING:
    from .case import Case

class Client(Base):
    __tablename__ = "clients"
    id:  Mapped[int] = mapped_column(primary_key=True, index=True)
    #Note: Since we have used Mapped[int] we dont need 
    #mapped_column(Integer(30), primary_key=True, autoincrement=True, nullable=False)
    #As sqlalchemy automatically recognises it aas int
    #And a int primary key is autoincrement by default

    name:  Mapped[str] = mapped_column(String(100),  nullable=False)

    phone: Mapped[str | None] = mapped_column(String(13))
    email: Mapped[str | None] = mapped_column(String(100))
    address: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default= lambda: datetime.now(timezone.utc),
        nullable=False
    ) 

    cases: Mapped[list["Case"]] = relationship(
        back_populates="client",
        cascade="all, delete-orphan"
    )