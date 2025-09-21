from flask import Blueprint, request, jsonify
from services.community_service import get_all_posts, create_post, like_post, add_comment, delete_post, deep_serialize_objectid
from werkzeug.utils import secure_filename
import os

community_bp = Blueprint("community", __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@community_bp.route("/posts", methods=["POST"])
def create_post_route():
    try:
        user_id = None
        content = None

        if request.is_json:
            data = request.get_json()
            user_id = data.get("user_id")
            content = data.get("content")
        else:
            user_id = request.form.get("user_id")
            content = request.form.get("content")

        if not user_id or not content:
            return jsonify({"status": "error", "message": "Missing required fields"}), 400

        media_url = None
        if 'media' in request.files:
            file = request.files['media']
            if file.filename != '':
                filename = secure_filename(file.filename)
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                file.save(file_path)
                media_url = f"/uploads/{filename}"

        post = create_post(
            user_id,
            content,
            media_url,
            getattr(community_bp, 'socketio', None)
        )
        return jsonify({"status": "success", "post": deep_serialize_objectid(post)}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@community_bp.route("/posts", methods=["GET"])
def get_posts_route():
    try:
        posts = get_all_posts()
        serialized_posts = deep_serialize_objectid(posts)
        return jsonify({"status": "success", "posts": serialized_posts}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@community_bp.route("/posts/<post_id>/like", methods=["POST"])
def like_post_route(post_id):
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        if not user_id:
            return jsonify({"status": "error", "message": "User ID is required to like a post"}), 400

        post = like_post(post_id, user_id)  # FIX: Do NOT pass socketio
        if post:
            serialized_post = deep_serialize_objectid(post)
            return jsonify({"status": "success", "post": serialized_post}), 200
        return jsonify({"status": "error", "message": "Post not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@community_bp.route("/posts/<post_id>/comment", methods=["POST"])
def comment_post(post_id):
    try:
        data = request.get_json()
        if not data or "text" not in data or "user_id" not in data:
            return jsonify({"status": "error", "message": "Missing required fields"}), 400

        socketio = getattr(community_bp, 'socketio', None)
        post = add_comment(
            post_id,
            data.get("text"),
            data.get("user_id"),
            socketio
        )
        if post:
            serialized_post = deep_serialize_objectid(post)
            return jsonify({"status": "success", "post": serialized_post}), 200
        return jsonify({"status": "error", "message": "Post not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@community_bp.route("/posts/<post_id>", methods=["DELETE"])
def delete_post_route(post_id):
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        if not user_id:
            return jsonify({"status": "error", "message": "User ID is required for deletion"}), 400

        success = delete_post(post_id, user_id, getattr(community_bp, 'socketio', None))
        if success:
            return jsonify({"status": "success", "message": "Post deleted"}), 200
        else:
            return jsonify({"status": "error", "message": "Post not found or user not authorized"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500