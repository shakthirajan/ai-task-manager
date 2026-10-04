from datetime import date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session
import models, schemas
from database import get_db

router = APIRouter()

def get_or_404(db, task_id):
    task = db.get(models.Task, task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    return task

@router.get("/tasks", response_model=List[schemas.TaskOut])
def list_tasks(search: Optional[str] = None, status: Optional[str] = None,
               priority: Optional[str] = None, due: Optional[str] = None,
               db: Session = Depends(get_db)):
    q = db.query(models.Task)
    if search:
        like = f"%{search}%"
        q = q.filter(or_(models.Task.title.ilike(like), models.Task.description.ilike(like)))
    if status:   q = q.filter(models.Task.status == status)
    if priority: q = q.filter(models.Task.priority == priority)
    today = date.today()
    if due == "overdue": q = q.filter(models.Task.due_date < today, models.Task.status != "Done")
    elif due == "today": q = q.filter(models.Task.due_date == today)
    elif due == "week":  q = q.filter(models.Task.due_date >= today, models.Task.due_date <= today + timedelta(days=7))
    return q.order_by(models.Task.created_at.desc()).all()

@router.post("/tasks", response_model=schemas.TaskOut, status_code=201)
def create_task(data: schemas.TaskCreate, db: Session = Depends(get_db)):
    task = models.Task(**data.model_dump())
    db.add(task); db.commit(); db.refresh(task)
    return task

@router.get("/tasks/{task_id}", response_model=schemas.TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, task_id)

@router.put("/tasks/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, data: schemas.TaskCreate, db: Session = Depends(get_db)):
    task = get_or_404(db, task_id)
    for k, v in data.model_dump().items():
        setattr(task, k, v)
    db.commit(); db.refresh(task)
    return task

@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db.delete(get_or_404(db, task_id)); db.commit()

@router.patch("/tasks/{task_id}/complete", response_model=schemas.TaskOut)
def toggle_complete(task_id: int, db: Session = Depends(get_db)):
    task = get_or_404(db, task_id)
    task.status = "Todo" if task.status == "Done" else "Done"
    db.commit(); db.refresh(task)
    return task

@router.get("/dashboard/stats")
def stats(db: Session = Depends(get_db)):
    tasks, today = db.query(models.Task).all(), date.today()
    by = {s: sum(t.status == s for t in tasks) for s in ("Todo", "In Progress", "Done")}
    overdue = sum(1 for t in tasks if t.due_date and t.due_date < today and t.status != "Done")
    return {"total": len(tasks), "completed": by["Done"], "pending": len(tasks) - by["Done"],
            "overdue": overdue, "by_status": by}
