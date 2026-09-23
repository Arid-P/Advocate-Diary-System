from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from advocatediarysystem.database import get_db
from advocatediarysystem.schemas import advocate as advocate_schemas
from advocatediarysystem.schemas import client as client_schemas
from advocatediarysystem.crud import advocate as advocate_crud
from advocatediarysystem.crud import client as client_crud

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/advocate/signup",
    response_model=advocate_schemas.AdvocateRead,
    status_code=status.HTTP_201_CREATED,
)
def advocate_signup(
    advocate_in: advocate_schemas.AdvocateCreate,
    db: Session = Depends(get_db),
):
    """Register a new advocate practitioner."""
    # Check for existing email
    existing_email = advocate_crud.get_advocate_by_email(db, advocate_in.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An advocate with email '{advocate_in.email}' is already registered.",
        )

    # Check for existing bar enrollment number
    existing_enrollment = advocate_crud.get_advocate_by_enrollment(
        db, advocate_in.enrollment_number
    )
    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An advocate with Bar Enrollment '{advocate_in.enrollment_number}' is already registered.",
        )

    return advocate_crud.create_advocate(db, advocate_in)


@router.post("/advocate/login")
def advocate_login(
    login_data: advocate_schemas.AdvocateLogin,
    db: Session = Depends(get_db),
):
    """Authenticate advocate via Bar Enrollment Number, Email, or Phone."""
    advocate = advocate_crud.authenticate_advocate(
        db=db,
        identifier=login_data.identifier,
        password=login_data.password,
    )
    if not advocate:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your enrollment number/email and password.",
        )

    return {
        "message": "Login successful",
        "advocate": advocate_schemas.AdvocateRead.model_validate(advocate),
    }


@router.post(
    "/client/signup",
    response_model=client_schemas.ClientRead,
    status_code=status.HTTP_201_CREATED,
)
def client_signup(
    client_in: client_schemas.ClientCreate,
    db: Session = Depends(get_db),
):
    """Self-service registration for clients to access their matters."""
    return client_crud.create_client(db, client_in)
