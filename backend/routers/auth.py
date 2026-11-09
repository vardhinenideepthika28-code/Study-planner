from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pwdlib import PasswordHash

try:
    from bson import ObjectId
except ImportError:
    ObjectId = None

from database import get_db, get_mongo, USE_MONGODB
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
    mongo = get_mongo()
    if USE_MONGODB and mongo is not None:
        # Check whether email already exists in MongoDB
        existing_user = mongo["users"].find_one({"email": user.email})
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        # Hash password
        hashed_password = password_hash.hash(user.password)

        result = mongo["users"].insert_one({
            "full_name": user.full_name,
            "email": user.email,
            "password": hashed_password
        })

        return {
            "id": str(result.inserted_id),
            "full_name": user.full_name,
            "email": user.email
        }

    # SQLite fallback
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = password_hash.hash(user.password)

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
    mongo = get_mongo()
    if USE_MONGODB and mongo is not None:
        existing_user = mongo["users"].find_one({"email": user.email})
        if not existing_user or not password_hash.verify(user.password, existing_user.get("password", "")):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        return {
            "id": str(existing_user["_id"]),
            "full_name": existing_user["full_name"],
            "email": existing_user["email"]
        }

    # SQLite fallback
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user or not password_hash.verify(user.password, existing_user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return existing_user
