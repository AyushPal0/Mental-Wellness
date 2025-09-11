# routes/task_routes.py
from flask import Blueprint, request, jsonify
from services import task_service
import asyncio

task_bp = Blueprint("tasks", __name__)

# ------------------------
# Create a new task
# ------------------------
@task_bp.route("/tasks", methods=["POST"])
def create_task():
    data = request.get_json()
    task = asyncio.run(task_service.create_task(data))
    return jsonify(task.to_dict()), 201

# ------------------------
# Get all tasks + suggestion
# ------------------------
@task_bp.route("/tasks", methods=["GET"])
def get_tasks():
    tasks = asyncio.run(task_service.get_all_tasks())
    task_dicts = [task.to_dict() for task in tasks]

    # --- Simple wellness suggestion logic ---
    suggestion = None
    if len(task_dicts) > 5:
        suggestion = "You’ve got a heavy workload. Take a 5-minute stretch break!"
    elif not task_dicts:
        suggestion = "No tasks today? Maybe do a quick mindfulness exercise."
    else:
        suggestion = "Great job staying on track! Stay hydrated."

    return jsonify({"tasks": task_dicts, "suggestion": suggestion}), 200

# ------------------------
# Get a single task by ID
# ------------------------
@task_bp.route("/tasks/<task_id>", methods=["GET"])
def get_task(task_id):
    task = asyncio.run(task_service.get_task_by_id(task_id))
    if not task:
        return jsonify({"message": "Task not found"}), 404
    return jsonify(task.to_dict()), 200

# ------------------------
# Update a task
# ------------------------
@task_bp.route("/tasks/<task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json()
    task = asyncio.run(task_service.update_task(task_id, data))
    if not task:
        return jsonify({"message": "Task not found"}), 404
    return jsonify(task.to_dict()), 200

# ------------------------
# Delete a task
# ------------------------
@task_bp.route("/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id):
    success = asyncio.run(task_service.delete_task(task_id))
    if not success:
        return jsonify({"message": "Task not found"}), 404
    return jsonify({"message": "Task deleted"}), 200
