# backend/routes/task_routes.py

from flask import Blueprint, request, jsonify
from services import task_service
import logging

task_bp = Blueprint("tasks", __name__)
logger = logging.getLogger(__name__)

@task_bp.route("/tasks/ai-suggestion/<user_id>", methods=["GET"])
def get_ai_suggestion_route(user_id):
    """Gets an AI-powered task suggestion."""
    try:
        suggestion = task_service.get_ai_task_suggestion(user_id)
        return jsonify(suggestion), 200
    except Exception as e:
        logger.error(f"Error in AI suggestion route: {e}")
        return jsonify({"error": str(e)}), 500

@task_bp.route("/tasks", methods=["POST"])
def create_task_route():
    try:
        data = request.get_json()
        if not data or "title" not in data or "user_id" not in data:
            return jsonify({"error": "Title and user_id are required"}), 400
        
        task = task_service.create_task(data)
        return jsonify(task.to_dict()), 201
    except Exception as e:
        logger.error(f"Error in create task route: {e}")
        return jsonify({"error": str(e)}), 500

@task_bp.route("/tasks/user/<user_id>", methods=["GET"])
def get_tasks_for_user_route(user_id):
    try:
        tasks = task_service.get_tasks_by_user(user_id)
        task_dicts = [task.to_dict() for task in tasks]
        # Note: The 'suggestion' field is optional. 
        # The AI suggestion is now fetched from its own dedicated endpoint.
        return jsonify({"tasks": task_dicts}), 200
    except Exception as e:
        logger.error(f"Error in get tasks for user route: {e}")
        return jsonify({"error": str(e)}), 500

@task_bp.route("/tasks/<task_id>", methods=["GET"])
def get_task_route(task_id):
    try:
        task = task_service.get_task_by_id(task_id)
        if not task:
            return jsonify({"message": "Task not found"}), 404
        return jsonify(task.to_dict()), 200
    except Exception as e:
        logger.error(f"Error in get task route: {e}")
        return jsonify({"error": str(e)}), 500

@task_bp.route("/tasks/<task_id>", methods=["PUT"])
def update_task_route(task_id):
    """Handles updating a task (e.g., changing its status)."""
    try:
        data = request.get_json()
        if "user_id" not in data:
             return jsonify({"error": "user_id is required for updates"}), 400
        
        task = task_service.update_task(task_id, data)
        if not task:
            return jsonify({"message": "Task not found or user not authorized"}), 404
        return jsonify(task.to_dict()), 200
    except Exception as e:
        logger.error(f"Error in update task route: {e}")
        return jsonify({"error": str(e)}), 500

@task_bp.route("/tasks/<task_id>", methods=["DELETE"])
def delete_task_route(task_id):
    """Handles deleting a task."""
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        if not user_id:
            return jsonify({"error": "user_id is required for deletion"}), 400
            
        success = task_service.delete_task(task_id, user_id)
        if not success:
            return jsonify({"message": "Task not found or user not authorized"}), 404
        return jsonify({"message": "Task deleted"}), 200
    except Exception as e:
        logger.error(f"Error in delete task route: {e}")
        return jsonify({"error": str(e)}), 500