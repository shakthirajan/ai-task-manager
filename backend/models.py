from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Date, DateTime
from database import Base

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    priority = Column(String(10), default="Medium")   # Low / Medium / High
    status = Column(String(20), default="Todo")       # Todo / In Progress / Done
    due_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
