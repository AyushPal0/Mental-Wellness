# backend/services/task_service.py
import os
import sys
import logging
import json # <-- FIX: Added this import
from datetime import datetime, date, timedelta
from typing import Optional, List
from bson import ObjectId

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.task import Task
from utils.db import get_db
from services.chat_service import chat_model
from langchain.prompts import ChatPromptTemplate

logger = logging.getLogger(__name__)
db = get_db()

def _update_streak(user_id: str):
    """Handles the logic for updating a user's daily task streak."""
    try:
        user_obj_id = ObjectId(user_id)
        user = db.users.find_one({"_id": user_obj_id})
        if not user: return

        today = date.today()
        last_completion = user.get('last_task_completion_date')
        
        last_completion_date = last_completion.date() if last_completion and isinstance(last_completion, datetime) else None

        if last_completion_date == today: return

        current_streak = user.get('streak', 0)
        new_streak = current_streak + 1 if last_completion_date == today - timedelta(days=1) else 1
        
        db.users.update_one(
            {"_id": user_obj_id},
            {"$set": {"streak": new_streak, "last_task_completion_date": datetime.combine(today, datetime.min.time())}}
        )
        logger.info(f"Streak updated for user {user_id} to {new_streak}")
    except Exception as e:
        logger.error(f"Error updating streak for user {user_id}: {e}")

def get_ai_task_suggestion(user_id: str) -> dict:
    # ... (This function is now correct with the json import)
    try:
        user_tasks = get_tasks_by_user(user_id)
        task_titles = [f"- {task.title} (Status: {task.status})" for task in user_tasks[:10]]
        
        if not task_titles:
            return {"title": "Practice a 5-minute mindfulness exercise."}

        template = "Based on these tasks:\n{tasks}\n\nSuggest a new, simple, and actionable mental wellness task. Provide only a JSON object with a 'title' key."
        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | chat_model
        response = chain.invoke({"tasks": "\n".join(task_titles)})
        
        # Clean the response to ensure it's valid JSON
        cleaned_content = response.content.strip().replace("```json", "").replace("```", "")
        return json.loads(cleaned_content)
    except Exception as e:
        logger.error(f"Error generating AI task suggestion: {e}")
        return {"title": "Reflect on a positive memory"}

def create_task(data: dict) -> Task:
    # ... (No changes needed here)
    if not data or "title" not in data or "user_id" not in data:
        raise ValueError("Title and user_id are required")
    new_task = Task(**data)
    db.tasks.insert_one(new_task.to_dict())
    return new_task

def get_tasks_by_user(user_id: str) -> List[Task]:
    # ... (No changes needed here)
    tasks_data = list(db.tasks.find({"user_id": user_id}))
    return [Task.from_dict(task_data) for task_data in tasks_data]

def get_task_by_id(task_id: str) -> Optional[Task]:
    # ... (No changes needed here)
    task_data = db.tasks.find_one({"id": task_id})
    return Task.from_dict(task_data) if task_data else None

def update_task(task_id: str, data: dict) -> Optional[Task]:
    user_id = data.pop("user_id", None)
    if not user_id: return None
    
    # Ensure the task belongs to the user trying to update it
    task_data = db.tasks.find_one({"id": task_id, "user_id": user_id})
    if not task_data: return None

    update_data = {k: v for k, v in data.items() if v is not None}
    if not update_data: return Task.from_dict(task_data)
        
    db.tasks.update_one({"id": task_id}, {"$set": update_data})
    
    if update_data.get("status") == "completed":
        _update_streak(user_id)
    
    updated_task_data = db.tasks.find_one({"id": task_id})
    return Task.from_dict(updated_task_data)

def delete_task(task_id: str, user_id: str) -> bool:
    """Deletes a task by its ID, ensuring it belongs to the user."""
    result = db.tasks.delete_one({"id": task_id, "user_id": user_id})
    if result.deleted_count > 0:
        logger.info(f"Task {task_id} deleted by user {user_id}")
        return True
    logger.warning(f"Failed to delete task {task_id}. It may not exist or user {user_id} is not the owner.")
    return False