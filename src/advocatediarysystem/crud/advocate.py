from sqlalchemy import select, or_
from sqlalchemy.orm import Session

from advocatediarysystem.models.advocate import Advocate
from advocatediarysystem.schemas.advocate import AdvocateCreate
from advocatediarysystem.utils.security import hash_password, verify_password
from advocatediarysystem.utils.logger import setup_logger

logger = setup_logger("crud.advocate")


def create_advocate(db: Session, advocate_in: AdvocateCreate) -> Advocate:
    """Create a new Advocate practitioner in the database with hashed password."""
    data = advocate_in.model_dump()
    raw_password = data.pop("password")
    data["hashed_password"] = hash_password(raw_password)

    new_advocate = Advocate(**data)
    db.add(new_advocate)
    db.commit()
    db.refresh(new_advocate)

    logger.info(f"Registered new advocate ID: {new_advocate.id}, Enrollment: {new_advocate.enrollment_number}")
    return new_advocate


def get_advocate_by_id(db: Session, advocate_id: int) -> Advocate | None:
    query = select(Advocate).where(Advocate.id == advocate_id)
    return db.scalar(query)


def get_advocate_by_email(db: Session, email: str) -> Advocate | None:
    query = select(Advocate).where(Advocate.email == email.strip().lower())
    return db.scalar(query)


def get_advocate_by_enrollment(db: Session, enrollment_number: str) -> Advocate | None:
    query = select(Advocate).where(Advocate.enrollment_number == enrollment_number.strip())
    return db.scalar(query)


def get_advocate_by_identifier(db: Session, identifier: str) -> Advocate | None:
    """Lookup advocate by enrollment number, email, or phone number."""
    clean = identifier.strip()
    query = select(Advocate).where(
        or_(
            Advocate.enrollment_number == clean,
            Advocate.email == clean.lower(),
            Advocate.phone == clean,
        )
    )
    return db.scalar(query)


def authenticate_advocate(db: Session, identifier: str, password: str) -> Advocate | None:
    """Verify advocate credentials."""
    advocate = get_advocate_by_identifier(db, identifier)
    if not advocate:
        logger.warning(f"Advocate auth failed: no user matching '{identifier}'")
        return None

    if not verify_password(password, advocate.hashed_password):
        logger.warning(f"Advocate auth failed: invalid password for '{identifier}'")
        return None

    logger.info(f"Advocate '{advocate.name}' successfully authenticated.")
    return advocate
