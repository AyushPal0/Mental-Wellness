import json
import os
from flask import Blueprint, jsonify, request
from services.personality_service import save_or_update_personality
from services.question_service import get_all_questions

personality_bp = Blueprint("personality", __name__)

# FIX: The route path is now just "/questions", which will be correctly 
# prefixed by your app to become /api/personality/questions
@personality_bp.route("/questions", methods=["GET"])
def get_questions():
    """
    Serve the personality test questions from the question service.
    """
    questions = get_all_questions()
    if not questions:
        return jsonify({"success": False, "error": "Could not load questions."}), 500
    
    # Ensure the "success" flag is always present for the frontend
    return jsonify({"success": True, "questions": questions})


# FIX: The route path is now just "/submit"
@personality_bp.route("/submit", methods=["POST"])
def submit_personality():
    """
    Accepts raw answers, calculates scores on the backend, and saves the result.
    """
    data = request.json
    user_id = data.get("userId")
    answers = data.get("answers")

    if not user_id or not answers:
        return jsonify({"success": False, "error": "Missing userId or answers"}), 400

    # Backend scoring logic...
    scores = {'I': 0, 'E': 0, 'N': 0, 'S': 0, 'T': 0, 'F': 0, 'J': 0, 'P': 0}
    all_questions_list = get_all_questions()
    all_questions_map = {q['id']: q for q in all_questions_list}

    for answer in answers:
        question_id = answer.get("questionId")
        value = answer.get("value")
        question = all_questions_map.get(question_id)

        if question:
            dim1, dim2 = question['dimension']
            if value <= 2:
                scores[dim1] += (3 - value)
            elif value >= 4:
                scores[dim2] += (value - 3)

    personality = save_or_update_personality(user_id, scores)

    return jsonify({
        "success": True, 
        "message": "Personality saved successfully", 
        "personalityType": personality.personality_type
    })