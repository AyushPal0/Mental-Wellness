from flask import Blueprint, request, jsonify
from services import community_service

community_bp = Blueprint("community", __name__)

@community_bp.route("/posts", methods=["POST"])
def create_post():
    data = request.get_json()
    post = community_service.create_post(
        user_id=data.get("user_id"),
        content=data.get("content"),
        media_url=data.get("media_url")
    )
    return jsonify({"status": "success", "post": post.to_dict()}), 201

@community_bp.route("/posts", methods=["GET"])
def get_posts():
    posts = community_service.get_all_posts()
    return jsonify({"status": "success", "posts": posts}), 200

@community_bp.route("/posts/<post_id>", methods=["GET"])
def get_single_post(post_id):
    post = community_service.get_post(post_id)
    if post:
        return jsonify({"status": "success", "post": post}), 200
    return jsonify({"status": "error", "message": "Post not found"}), 404

@community_bp.route("/posts/<post_id>/like", methods=["POST"])
def like_post(post_id):
    post = community_service.like_post(post_id)
    if post:
        return jsonify({"status": "success", "post": post}), 200
    return jsonify({"status": "error", "message": "Post not found"}), 404

@community_bp.route("/posts/<post_id>/comment", methods=["POST"])
def comment_post(post_id):
    data = request.get_json()
    post = community_service.add_comment(post_id, data.get("text"), data.get("user_id"))
    if post:
        return jsonify({"status": "success", "post": post}), 200
    return jsonify({"status": "error", "message": "Post not found"}), 404
