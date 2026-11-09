from pydantic import BaseModel
from datetime import date
from typing import Optional, Union


# -------------------------
# User Schemas
# -------------------------

class UserSignup(BaseModel):
    full_name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: Union[str, int]
    full_name: str
    email: str

    class Config:
        from_attributes = True


# -------------------------
# Task Schemas
# -------------------------

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject: str
    priority: str = "Medium"
    deadline: Optional[date] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[date] = None
    completed: Optional[bool] = None


class TaskResponse(BaseModel):
    id: Union[str, int]
    title: str
    description: Optional[str] = None
    subject: str
    priority: str
    deadline: Optional[date] = None
    completed: bool
    user_id: Union[str, int]

    class Config:
        from_attributes = True

    class Config:
        from_attributes = True