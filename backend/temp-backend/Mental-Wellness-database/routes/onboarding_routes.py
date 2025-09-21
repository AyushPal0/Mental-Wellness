# backend/routes/onboarding_routes.py

from flask import Blueprint, request, jsonify
from services import onboarding_service

onboarding_bp = Blueprint("onboarding", __name__)

@onboarding_bp.route("/status/<user_id>", methods=["GET"])
def get_status(user_id):
    status = onboarding_service.get_onboarding_status(user_id)
    if status is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(status), 200

@onboarding_bp.route("/update", methods=["POST"])
def update_status():
    data = request.get_json()
    user_id = data.get("user_id")
    step = data.get("step")
    status = data.get("status")
    
    if not all([user_id, step, status]):
        return jsonify({"error": "Missing required fields"}), 400
        
    onboarding_service.update_onboarding_status(user_id, step, status)
    return jsonify({"message": "Onboarding status updated"}), 200

@onboarding_bp.route("/assign-game", methods=["POST"])
def assign_game():
    data = request.get_json()
    user_id = data.get("user_id")
    
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
        
    assigned_game = onboarding_service.assign_game(user_id)
    return jsonify({"game": assigned_game}), 200