from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Task
from schemas import TaskCreate, TaskUpdate, TaskResponse


router = APIRouter(
    prefix="/api/tasks",
    tags=["Tasks"]
)


# -------------------------
# Add a new task
# -------------------------

@router.post("/", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    user_id: int,
    db: Session = Depends(get_db)
):
    new_task = Task(
        title=task.title,
        description=task.description,
        subject=task.subject,
        priority=task.priority,
        deadline=task.deadline,
        completed=False,
        user_id=user_id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


# -------------------------
# Get all tasks
# -------------------------

@router.get("/{user_id}", response_model=list[TaskResponse])
def get_tasks(
    user_id: int,
    db: Session = Depends(get_db)
):
    tasks = db.query(Task).filter(
        Task.user_id == user_id
    ).all()

    return tasks


# -------------------------
# Update a task
# -------------------------

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task: TaskUpdate,
    user_id: int,
    db: Session = Depends(get_db)
):
    existing_task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id
    ).first()

    if not existing_task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    update_data = task.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(existing_task, key, value)

    db.commit()
    db.refresh(existing_task)

    return existing_task


# -------------------------
# Delete a task
# -------------------------

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    existing_task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id
    ).first()

    if not existing_task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(existing_task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }


# -------------------------
# Complete / Undo task
# -------------------------

@router.patch("/{task_id}/complete")
def toggle_task(
    task_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    existing_task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id
    ).first()

    if not existing_task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    existing_task.completed = not existing_task.completed

    db.commit()
    db.refresh(existing_task)

    return {
        "message": "Task status updated",
        "completed": existing_task.completed
    }