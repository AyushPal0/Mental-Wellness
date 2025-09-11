# services/task_service.py
from models.task import Task
from datetime import datetime
from typing import Optional

async def create_task(data: dict) -> Task:
    new_task = Task(
        title=data.get("title"),
        description=data.get("description"),
        category=data.get("category"),
        due_date=datetime.fromisoformat(data["due_date"]) if data.get("due_date") else None
    )
    await new_task.insert()
    return new_task

async def get_all_tasks():
    return await Task.find_all().to_list()

async def get_task_by_id(task_id: str) -> Optional[Task]:
    return await Task.find_one(Task.id == task_id)

async def update_task(task_id: str, data: dict) -> Optional[Task]:
    task = await Task.find_one(Task.id == task_id)
    if not task:
        return None

    if "title" in data:
        task.title = data["title"]
    if "description" in data:
        task.description = data["description"]
    if "category" in data:
        task.category = data["category"]
    if "status" in data:
        task.status = data["status"]
    if "due_date" in data:
        task.due_date = datetime.fromisoformat(data["due_date"]) if data["due_date"] else None

    await task.save()
    return task

async def delete_task(task_id: str) -> bool:
    task = await Task.find_one(Task.id == task_id)
    if not task:
        return False
    await task.delete()
    return True
