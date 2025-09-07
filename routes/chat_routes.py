# backend/routes/chat_routes.py
from flask import Blueprint, request, jsonify
from backend.services.chat_service import get_chat_response
from bson import ObjectId

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_id = data.get("user_id")
    message = data.get("message")

    if not user_id or not message:
        return jsonify({"error": "user_id and message are required"}), 400

    try:
        response = get_chat_response(ObjectId(user_id), message)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
