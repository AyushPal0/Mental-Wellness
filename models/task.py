# models/task_model.py
from datetime import datetime
from beanie import Document
from pydantic import BaseModel, Field
from typing import Optional
import uuid

class Task(Document):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    status: str = "pending"   # pending | completed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    due_date: Optional[datetime] = None

    class Settings:
        name = "tasks"   # MongoDB collection name

    def to_dict(self):
        return self.dict()
