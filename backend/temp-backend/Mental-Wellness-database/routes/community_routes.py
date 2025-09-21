from flask import Blueprint, request, jsonify
from services.community_service import (
    get_all_posts_with_user_data,
    create_post_service,
    delete_post_service,
    like_post_service,
    add_comment_service
)
from werkzeug.utils import secure_filename
import os
import json
# Import the custom encoder and the shared socketio instance
from utils.json_encoder import MongoJSONEncoder
from extensions import socketio

community_bp = Blueprint("community", __name__)


@community_bp.route("/posts", methods=["GET"])
def get_posts_route():
    try:
        posts = get_all_posts_with_user_data()
        return jsonify({"posts": posts})
    except Exception as e:
        print(f"Error in get_posts_route: {e}")
        return jsonify({"error": "Failed to retrieve posts"}), 500


@community_bp.route("/posts", methods=["POST"])
def create_post_route():
    try:
        user_id = request.form.get("user_id")
        content = request.form.get("content")
        media_file = request.files.get('media')

        if not user_id or not content:
            return jsonify({"error": "Missing user_id or content"}), 400

        new_post = create_post_service(user_id, content, media_file)

        # Explicitly serialize the data before emitting to ensure it's JSON-safe
        socketio.emit('new_post', json.loads(json.dumps(new_post, cls=MongoJSONEncoder)))
            
        return jsonify(new_post), 201
    except Exception as e:
        print(f"Error creating post: {e}")
        return jsonify({"error": "Failed to create post"}), 500


@community_bp.route("/posts/<post_id>/like", methods=["POST"])
def like_post_route(post_id):
    data = request.get_json()
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    
    updated_likes = like_post_service(post_id, user_id)
    if updated_likes is not None:
        # This payload is already a list of strings and is safe
        socketio.emit('post_update', {'post_id': post_id, 'likes': updated_likes})
        return jsonify({"likes": updated_likes}), 200
    return jsonify({"error": "Post not found"}), 404


@community_bp.route("/posts/<post_id>/comment", methods=["POST"])
def add_comment_route(post_id):
    data = request.get_json()
    user_id = data.get("user_id")
    text = data.get("text")
    if not user_id or not text:
        return jsonify({"error": "User ID and text are required"}), 400
    
    new_comment = add_comment_service(post_id, user_id, text)
    if new_comment:
        # Explicitly serialize the new_comment object before emitting
        socketio.emit('comment_update', {
            'post_id': post_id, 
            'comment': json.loads(json.dumps(new_comment, cls=MongoJSONEncoder))
        })
        return jsonify(new_comment), 201
    return jsonify({"error": "Post not found"}), 404


@community_bp.route("/posts/<post_id>", methods=["DELETE"])
def delete_post_route(post_id):
    data = request.get_json()
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    
    success = delete_post_service(post_id, user_id)
    if success:
        # This payload is already clean
        socketio.emit('post_deleted', {'post_id': post_id})
        return jsonify({"message": "Post deleted successfully"}), 200
    return jsonify({"error": "Post not found or user not authorized"}), 404