from flask import Blueprint, request, jsonify
from models.risk_event import RiskEvent
from services.safety_service import process_risk_event

safety_bp = Blueprint("safety", __name__)

@safety_bp.route("/risk-event", methods=["POST"])
def handle_risk_event():
    data = request.get_json()
    event = RiskEvent(
        user_id=data.get("user_id"),
        risk_level=data.get("risk_level"),
        message=data.get("message")
    )
    result = process_risk_event(event)
    return jsonify({"status": "success", "data": result}), 200
