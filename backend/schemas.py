from datetime import date, datetime
from typing import Literal, Optional, List
from pydantic import BaseModel, Field

Priority = Literal["Low", "Medium", "High"]
Status = Literal["Todo", "In Progress", "Done"]

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field("", max_length=4000)
    priority: Priority = "Medium"
    status: Status = "Todo"
    due_date: Optional[date] = None

class TaskOut(TaskCreate):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}

# ---- AI schemas ----
class GenerateIn(BaseModel):
    text: str = Field(min_length=3, max_length=2000)

class TaskIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field("", max_length=4000)
    due_date: Optional[date] = None

class AITask(BaseModel):
    title: str
    description: str = ""
    priority: Priority = "Medium"
    due_date: Optional[date] = None

class TasksOut(BaseModel):
    tasks: List[AITask]

class PriorityOut(BaseModel):
    priority: Priority
    reason: str

class SummaryOut(BaseModel):
    summary: str
