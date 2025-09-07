# backend/models/chat.py
from datetime import datetime
from bson import ObjectId

class Chat:
    def __init__(self, user_id, message, response, timestamp=None):
        self.user_id = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id
        self.message = message
        self.response = response
        self.timestamp = timestamp or datetime.utcnow()

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "message": self.message,
            "response": self.response,
            "timestamp": self.timestamp
        }
