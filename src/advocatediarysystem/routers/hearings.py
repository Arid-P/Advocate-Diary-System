from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session

from advocatediarysystem.database import get_db
import advocatediarysystem.schemas.hearing as hearing_schema
import advocatediarysystem.crud.hearing as hearing_crud

router = APIRouter(prefix="/hearings", tags=["Hearings"])


@router.post(
    "/", response_model=hearing_schema.HearingRead, status_code=status.HTTP_201_CREATED
)
def create_hearing(hearing_in: hearing_schema.HearingCreate, db: Session = Depends(get_db)):
    """Creates a new hearing in the database"""
    hearing = hearing_crud.create_hearing(db, hearing_in=hearing_in)
    return hearing


@router.get(
    "/hearing/{hearing_id}",
    response_model=hearing_schema.HearingRead,
    status_code=status.HTTP_200_OK,
)
def get_hearing_by_id(hearing_id: int, db: Session = Depends(get_db)):
    """Gets a hearing using its id"""
    hearing = hearing_crud.get_hearing_by_id(db, hearing_id=hearing_id)

    if not hearing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hearing with the id: {hearing_id} was not found in the database.",
        )

    return hearing


@router.get(
    "/case/{case_id}",
    response_model=list[hearing_schema.HearingRead],
    status_code=status.HTTP_200_OK,
)
def get_hearings_by_case(
    case_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """Gets a hearings associated with a case."""
    hearings = hearing_crud.get_hearings_by_case(
        db=db, case_id=case_id, skip=skip, limit=limit
    )

    if not hearings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hearings associated with the case with the id: {case_id} were not found in the database.",
        )

    return hearings


@router.get(
    "/",
    response_model=list[hearing_schema.HearingRead],
    status_code=status.HTTP_200_OK,
)
def get_hearings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Gets a all the hearings with the specified offset and limit."""
    hearings = hearing_crud.get_hearings(db=db, skip=skip, limit=limit)

    if not hearings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No hearing exists in the database.",
        )

    return hearings


@router.patch(
    "/hearing/{hearing_id}",
    response_model=hearing_schema.HearingRead,
    status_code=status.HTTP_200_OK,
)
def update_hearing(
    hearing_id: int, hearing_in: hearing_schema.HearingUpdate, db: Session = Depends(get_db)
):
    """Updates a hearing through the information provided"""
    db_hearing = hearing_crud.get_hearing_by_id(db, hearing_id=hearing_id)

    if not db_hearing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No hearing with the id: {hearing_id} exists in the database.",
        )

    updated_hearing = hearing_crud.update_hearing(db, db_hearing=db_hearing, hearing_in=hearing_in)

    return updated_hearing


@router.delete("/{hearing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hearing(hearing_id: int, db: Session = Depends(get_db)):
    """Deletes the hearing with the provided id"""
    db_hearing = hearing_crud.get_hearing_by_id(db, hearing_id=hearing_id)

    if not db_hearing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No hearing with the id: {hearing_id} was found in the database.",
        )

    hearing_crud.delete_hearing(db, db_hearing=db_hearing)
