# backend/services/onboarding_service.py

from utils.db import get_db
from bson import ObjectId
import random

def get_onboarding_status(user_id: str):
    """
    Get the onboarding status for a given user.
    """
    db = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return None
    return user.get("onboarding_status", {})

def update_onboarding_status(user_id: str, step: str, status: str):
    """
    Update the onboarding status for a given user.
    """
    db = get_db()
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {f"onboarding_status.{step}": status}}
    )

def assign_game(user_id: str):
    """
    Assign a game to the user based on their personality test results and chatbot interaction.
    """
    # In a real-world scenario, you would implement your AI logic here.
    # For now, we will assign a game randomly.
    games = ["ocd_pattern", "memory_game", "focus_game"]
    assigned_game = random.choice(games)
    
    update_onboarding_status(user_id, "game", assigned_game)
    return assigned_game