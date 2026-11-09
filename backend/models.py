from sqlalchemy import Column, Integer, String, Boolean, Date
from database import Base


# User table
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)


# Task table
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    description = Column(String, nullable=True)

    subject = Column(String, nullable=False)
    priority = Column(String, default="Medium")

    deadline = Column(Date, nullable=True)

    completed = Column(Boolean, default=False)

    # Connect task to a particular user
    user_id = Column(Integer, nullable=False)