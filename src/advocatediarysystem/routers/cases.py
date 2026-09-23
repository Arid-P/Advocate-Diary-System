from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session

from advocatediarysystem.database import get_db
import advocatediarysystem.schemas.case as case_schema
import advocatediarysystem.crud.case as case_crud

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.post(
    "/", response_model=case_schema.CaseRead, status_code=status.HTTP_201_CREATED
)
def create_case(case_in: case_schema.CaseCreate, db: Session = Depends(get_db)):
    """Creates a new case in the database"""
    case = case_crud.create_case(db, case_in=case_in)
    return case


@router.get(
    "/case/{case_id}",
    response_model=case_schema.CaseRead,
    status_code=status.HTTP_200_OK,
)
def get_case_by_id(case_id: int, db: Session = Depends(get_db)):
    """Gets a case using its id"""
    case = case_crud.get_case_by_id(db, case_id=case_id)

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with the id: {case_id} was not found in the database.",
        )

    return case


@router.get(
    "/client{client_id}",
    response_model=list[case_schema.CaseRead],
    status_code=status.HTTP_200_OK,
)
def get_cases_by_client(
    client_id: int, skip: int = 0, limit: int = 0, db: Session = Depends(get_db)
):
    """Gets a cases associated with a client."""
    cases = case_crud.get_cases_by_client(
        db=db, client_id=client_id, skip=skip, limit=limit
    )

    if not cases:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cases associated with the client with the id: {client_id} were not found in the database.",
        )

    return cases


@router.get(
    "/",
    response_model=list[case_schema.CaseRead],
    status_code=status.HTTP_200_OK,
)
def get_cases(skip: int = 0, limit: int = 0, db: Session = Depends(get_db)):
    """Gets a all the cases with the specified offset and limit."""
    cases = case_crud.get_cases(db=db, skip=skip, limit=limit)

    if not cases:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No case exists in the database.",
        )

    return cases


@router.patch(
    "/{case_id}", response_model=case_schema.CaseRead, status_code=status.HTTP_200_OK
)
def update_case(
    case_id: int, case_in: case_schema.CaseUpdate, db: Session = Depends(get_db)
):
    """Updates a case through the information provided"""
    db_case = case_crud.get_case_by_id(db, case_id=case_id)

    if not db_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No case with the id: {case_id} exists in the database.",
        )

    updated_case = case_crud.update_case(db, db_case=db_case, case_in=case_in)

    return updated_case


@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case(case_id: int, db: Session = Depends(get_db)):
    """Deletes the case with the provided id"""
    db_case = case_crud.get_case_by_id(db, case_id=case_id)

    if not db_case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No case with the id: {case_id} was found in the database.",
        )

    case_crud.delete_case(db, db_case=db_case)
