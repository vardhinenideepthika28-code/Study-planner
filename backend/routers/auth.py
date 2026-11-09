from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pwdlib import PasswordHash

from database import get_db
from models import User
from schemas import UserSignup, UserLogin, UserResponse


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

# Password hashing
password_hash = PasswordHash.recommended()


# -------------------------
# Signup
# -------------------------

@router.post("/signup", response_model=UserResponse)
def signup(
    user: UserSignup,
    db: Session = Depends(get_db)
):

    # Check whether email already exists
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = password_hash.hash(user.password)

    # Create user
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# -------------------------
# Login
# -------------------------

@router.post("/login", response_model=UserResponse)
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    # Find user
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Verify password
    if not password_hash.verify(
        user.password,
        existing_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return existing_user