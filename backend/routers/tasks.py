from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Union
try:
    from bson import ObjectId
except ImportError:
    ObjectId = None

from database import get_db, get_mongo, USE_MONGODB
from models import Task
from schemas import TaskCreate, TaskUpdate, TaskResponse


router = APIRouter(
    prefix="/api/tasks",
    tags=["Tasks"]
)


def _to_object_id(val: str):
    if ObjectId is None:
        return val
    try:
        return ObjectId(val)
    except Exception:
        return val


# -------------------------
# Add a new task
# -------------------------

@router.post("/", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    user_id: str,
    db: Session = Depends(get_db)
):
    mongo = get_mongo()
    if USE_MONGODB and mongo is not None:
        doc = {
            "title": task.title,
            "description": task.description,
            "subject": task.subject,
            "priority": task.priority,
            "deadline": task.deadline,
            "completed": False,
            "user_id": str(user_id)
        }
        res = mongo["tasks"].insert_one(doc)
        doc["id"] = str(res.inserted_id)
        return doc

    # SQLite fallback
    uid = int(user_id) if str(user_id).isdigit() else 1
    new_task = Task(
        title=task.title,
        description=task.description,
        subject=task.subject,
        priority=task.priority,
        deadline=task.deadline,
        completed=False,
        user_id=uid
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
    user_id: str,
    db: Session = Depends(get_db)
):
    mongo = get_mongo()
    if USE_MONGODB and mongo is not None:
        query = {
            "$or": [
                {"user_id": str(user_id)},
                {"user_id": int(user_id) if str(user_id).isdigit() else user_id}
            ]
        }
        task_docs = list(mongo["tasks"].find(query))
        result = []
        for t in task_docs:
            t["id"] = str(t["_id"])
            result.append(t)
        return result

    # SQLite fallback
    uid = int(user_id) if str(user_id).isdigit() else 1
    tasks = db.query(Task).filter(
        Task.user_id == uid
    ).all()

    return tasks


# -------------------------
# Update a task
# -------------------------

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    task: TaskUpdate,
    user_id: str,
    db: Session = Depends(get_db)
):
    mongo = get_mongo()
    if USE_MONGODB and mongo is not None:
        obj_id = _to_object_id(task_id)
        query = {
            "_id": obj_id,
            "$or": [
                {"user_id": str(user_id)},
                {"user_id": int(user_id) if str(user_id).isdigit() else user_id}
            ]
        }
        existing = mongo["tasks"].find_one(query)
        if not existing:
            raise HTTPException(status_code=404, detail="Task not found")

        update_data = task.model_dump(exclude_unset=True)
        mongo["tasks"].update_one(query, {"$set": update_data})
        updated = mongo["tasks"].find_one({"_id": obj_id})
        updated["id"] = str(updated["_id"])
        return updated

    # SQLite fallback
    tid = int(task_id) if str(task_id).isdigit() else 0
    uid = int(user_id) if str(user_id).isdigit() else 1
    existing_task = db.query(Task).filter(
        Task.id == tid,
        Task.user_id == uid
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
    task_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    mongo = get_mongo()
    if USE_MONGODB and mongo is not None:
        obj_id = _to_object_id(task_id)
        query = {
            "_id": obj_id,
            "$or": [
                {"user_id": str(user_id)},
                {"user_id": int(user_id) if str(user_id).isdigit() else user_id}
            ]
        }
        res = mongo["tasks"].delete_one(query)
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Task not found")
        return {"message": "Task deleted successfully"}

    # SQLite fallback
    tid = int(task_id) if str(task_id).isdigit() else 0
    uid = int(user_id) if str(user_id).isdigit() else 1
    existing_task = db.query(Task).filter(
        Task.id == tid,
        Task.user_id == uid
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
    task_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    mongo = get_mongo()
    if USE_MONGODB and mongo is not None:
        obj_id = _to_object_id(task_id)
        query = {
            "_id": obj_id,
            "$or": [
                {"user_id": str(user_id)},
                {"user_id": int(user_id) if str(user_id).isdigit() else user_id}
            ]
        }
        existing = mongo["tasks"].find_one(query)
        if not existing:
            raise HTTPException(status_code=404, detail="Task not found")

        new_status = not existing.get("completed", False)
        mongo["tasks"].update_one(query, {"$set": {"completed": new_status}})
        return {
            "message": "Task status updated",
            "completed": new_status
        }

    # SQLite fallback
    tid = int(task_id) if str(task_id).isdigit() else 0
    uid = int(user_id) if str(user_id).isdigit() else 1
    existing_task = db.query(Task).filter(
        Task.id == tid,
        Task.user_id == uid
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
