from .chat_routes import chat_bp
from .community_routes import community_bp
from .personality_routes import personality_bp
from .safety_routes import safety_bp
from .task_routes import task_bp
# from .game_routes import game_bp  # leave this out for now

__all__ = [
    "chat_bp",
    "community_bp",
    "personality_bp",
    "safety_bp",
    "task_bp",
    # "game_bp",
]
