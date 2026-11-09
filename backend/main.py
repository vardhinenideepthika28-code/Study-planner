from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import auth, tasks

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI application
app = FastAPI(
    title="StudyFlow API",
    description="Backend API for Student Study Planner",
    version="1.0.0"
)

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(tasks.router)


# Home route
@app.get("/")
def home():
    return {
        "message": "StudyFlow Backend is running successfully!"
    }


# Health check
@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }