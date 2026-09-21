from sqlalchemy import select
from sqlalchemy.orm import Session

from advocatediarysystem.models.hearing import Hearing
from advocatediarysystem.schemas.hearing import HearingCreate, HearingUpdate
from advocatediarysystem.utils.logger import setup_logger

logger = setup_logger("crud.hearing")


def create_hearing(db: Session, hearing_in: HearingCreate) -> Hearing:
    new_hearing: Hearing = Hearing(**hearing_in.model_dump(exclude_unset=True))

    db.add(new_hearing)
    db.commit()
    db.refresh(new_hearing)

    logger.info(f"Created a new hearing with ID: {new_hearing.id}")
    return new_hearing


def get_hearing_by_id(db: Session, hearing_id: int) -> Hearing | None:
    logger.info(f"Trying to fetch a hearing with id: {hearing_id}")

    query = select(Hearing).where(Hearing.id == hearing_id)
    hearing = db.scalar(query)

    if hearing:
        logger.info(f"Fetched the hearing.")
    else:
        logger.info(f"No such hearing exists in database.")
    return hearing


def get_hearings_by_case(db: Session, case_id: int, skip: int = 0, limit: int = 100) -> list[Hearing]:
    logger.info(f"Trying to fetch hearings of case with id: {case_id}")

    query = select(Hearing).where(Hearing.case_id == case_id).offset(skip).limit(limit)
    hearings = list(db.scalars(query).all())

    if hearings:
        logger.info(f"Fetched the hearings.")
    else:
        logger.info(f"No hearing for the case exist in database.")
    return hearings


def get_hearings(db: Session, skip: int = 0, limit: int = 100) -> list[Hearing]:
    query = select(Hearing).offset(skip).limit(limit)
    hearings = list(db.scalars(query).all())

    logger.info(f"Fetched {limit} hearings starting with the {skip+1}th one")
    return hearings
    


def update_hearing(db: Session, db_hearing: Hearing, hearing_in: HearingUpdate) -> Hearing:
    logger.warning(f"Trying to update the hearing with id: {db_hearing.id}") 

    update_data = hearing_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_hearing, field, value)

    db.commit()
    db.refresh(db_hearing)

    logger.info(f"Updated the hearing's informartion in the database.")
    return db_hearing


def delete_hearing(db: Session, db_hearing: Hearing) -> None:
    logger.warning(f"Trying to delete the hearing with id: {db_hearing.id}") 

    db.delete(db_hearing)
    db.commit()

    logger.info(f"The hearing's record is deleted")