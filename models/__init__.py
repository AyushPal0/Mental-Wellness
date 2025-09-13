from flask_pymongo import PyMongo

# Initialize MongoDB extension
mongo = PyMongo()

# Import all models so they are registered and ready to use
from .chat import Chat
from .personality import Personality
from .post import Post
from .risk_event import RiskEvent
from .task import Task

# Optional: define what can be imported directly from models
__all__ = [
    "mongo",
    "Chat",
    "Personality",
    "Post",
    "RiskEvent",
    "Task",
]
