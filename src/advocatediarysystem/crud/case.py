from sqlalchemy import select
from sqlalchemy.orm import Session

from advocatediarysystem.models.case import Case
from advocatediarysystem.schemas.case import CaseCreate, CaseUpdate
from advocatediarysystem.utils.logger import setup_logger

logger = setup_logger("crud.case")


def create_case(db: Session, case_in: CaseCreate) -> Case:
    new_case: Case = Case(**case_in.model_dump(exclude_unset=True))

    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    logger.info(f"Created a new case with ID: {new_case.id}")
    return new_case


def get_case_by_id(db: Session, case_id: int) -> Case | None:
    logger.info(f"Trying to fetch a case with id: {case_id}")

    query = select(Case).where(Case.id == case_id)
    case = db.scalar(query)

    if case:
        logger.info(f"Fetched the case.")
    else:
        logger.info(f"No such case exists in database.")
    return case


def get_cases_by_client(db: Session, client_id: int, skip: int = 0, limit: int = 100) -> list[Case]:
    logger.info(f"Trying to fetch cases of client with id: {client_id}")

    query = select(Case).where(Case.client_id == client_id).offset(skip).limit(limit)
    cases = list(db.scalars(query).all())

    if cases:
        logger.info(f"Fetched the cases.")
    else:
        logger.info(f"No case for the client exist in database.")
    return cases


def get_cases(db: Session, skip: int = 0, limit: int = 100) -> list[Case]:
    query = select(Case).offset(skip).limit(limit)
    cases = list(db.scalars(query).all())

    logger.info(f"Fetched {limit} cases starting with the {skip+1}th one")
    return cases
    


def update_case(db: Session, db_case: Case, case_in: CaseUpdate) -> Case:
    logger.warning(f"Trying to update the case with id: {db_case.id}") 

    update_data = case_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_case, field, value)

    db.commit()
    db.refresh(db_case)

    logger.info(f"Updated the case's informartion in the database.")
    return db_case


def delete_case(db: Session, db_case: Case) -> None:
    logger.warning(f"Trying to delete the case with id: {db_case.id}") 

    db.delete(db_case)
    db.commit()

    logger.info(f"The case's record is deleted")