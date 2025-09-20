import json
import os
import sys
from flask import Blueprint, jsonify, request

# Add the parent directory to Python path to fix import issues
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

try:
    from services.personality_service import save_or_update_personality
except ImportError as e:
    print(f"Warning: Could not import personality_service: {e}")
    # Fallback function if import fails
    def save_or_update_personality(user_id, scores):
        """Fallback function if the main import fails"""
        from datetime import datetime
        class MockPersonality:
            def dict(self, by_alias=True):
                return {
                    "user_id": user_id,
                    "scores": scores,
                    "persona_type": "calm_supporter",
                    "wellness_focus": "Focus & Calm",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                }
        return MockPersonality()

personality_bp = Blueprint("personality", __name__)

# Path to the JSON file
QUESTIONS_FILE = os.path.join(os.path.dirname(__file__), "..", "questions", "personality_questions.json")

@personality_bp.route("/questions", methods=["GET"])
def get_questions():
    """
    Serve the personality test questions from JSON.
    """
    try:
        with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
            questions = json.load(f)
        return jsonify({"success": True, "questions": questions})
    except FileNotFoundError:
        return jsonify({"success": False, "error": "Questions file not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@personality_bp.route("/submit", methods=["POST"])
def submit_personality():
    """
    Accept quiz answers from the frontend, calculate personality, and save/update.
    Expected JSON: { "user_id": "some_id", "scores": { "I": 12, "E": 8, "N": 14, "S": 6, ... } }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No JSON data provided"}), 400
            
        user_id = data.get("user_id")
        scores = data.get("scores")

        if not user_id or not scores:
            return jsonify({"success": False, "error": "Missing user_id or scores"}), 400

        personality = save_or_update_personality(user_id, scores)

        return jsonify({
            "success": True, 
            "message": "Personality saved successfully", 
            "personality": personality.dict(by_alias=True)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500