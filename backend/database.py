import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Check for MongoDB connection string
MONGODB_URL = os.getenv("MONGODB_URL") or os.getenv("MONGO_URI")
USE_MONGODB = bool(MONGODB_URL)

mongo_client = None
mongo_db = None

if USE_MONGODB:
    try:
        from pymongo import MongoClient
        mongo_client = MongoClient(MONGODB_URL)
        try:
            mongo_db = mongo_client.get_default_database()
            if mongo_db is None:
                mongo_db = mongo_client["studyflow"]
        except Exception:
            mongo_db = mongo_client["studyflow"]
        print("Connected to MongoDB successfully!")
    except Exception as e:
        print(f"Error initializing MongoDB: {e}")
        USE_MONGODB = False

# SQLite database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./studyflow.db")

# Create database engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for database models
Base = declarative_base()


# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_mongo():
    return mongo_db
