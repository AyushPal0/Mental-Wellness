# backend/services/community_service.py
from models.post import Post
from utils.db import get_db
from bson.objectid import ObjectId
from datetime import datetime
import os

def serialize_objectid(obj):
    """Recursively convert ObjectIds and datetime objects to strings in nested structures"""
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {key: serialize_objectid(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [serialize_objectid(item) for item in obj]
    elif hasattr(obj, '__dict__'):  # Handle custom objects
        return serialize_objectid(obj.__dict__)
    else:
        return obj

def deep_serialize_objectid(obj):
    """Deep serialization that handles all nested structures including custom objects"""
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        result = {}
        for key, value in obj.items():
            result[key] = deep_serialize_objectid(value)
        return result
    elif isinstance(obj, list):
        return [deep_serialize_objectid(item) for item in obj]
    elif hasattr(obj, '__dict__'):  # Handle custom objects
        return deep_serialize_objectid(obj.__dict__)
    elif hasattr(obj, '__iter__') and not isinstance(obj, str):  # Handle other iterables
        return [deep_serialize_objectid(item) for item in obj]
    else:
        return obj

def get_posts_collection():
    """Get the posts collection from MongoDB"""
    db = get_db()
    return db.posts

def create_post(user_id, content, media_url=None, socketio=None):
    post = Post(user_id, content, media_url)
    post_dict = post.to_dict()
    post_dict['user_id'] = ObjectId(user_id)

    posts_collection = get_posts_collection()
    result = posts_collection.insert_one(post_dict)
    
    pipeline = [
        {"$match": {"_id": result.inserted_id}},
        {"$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "_id",
            "as": "user_details"
        }},
        {"$unwind": "$user_details"},
        {"$addFields": {
            "user": {
                "_id": "$user_details._id",
                "username": "$user_details.username",
                "full_name": "$user_details.full_name",
                "avatar": "$user_details.avatar"
            }
        }},
        {"$project": { "user_details": 0, "user.password_hash": 0 }}
    ]
    new_post_agg = list(posts_collection.aggregate(pipeline))
    
    if new_post_agg:
        new_post = new_post_agg[0]
        new_post['_id'] = str(new_post['_id'])
        new_post['user_id'] = str(new_post['user_id'])
        new_post['user']['_id'] = str(new_post['user']['_id'])

        if socketio:
            socketio.emit('new_post', new_post)
        
        return new_post
    return None

def get_all_posts():
    posts_collection = get_posts_collection()
    pipeline = [
        {"$sort": {"created_at": -1}},
        {"$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "_id",
            "as": "user_details"
        }},
        {"$unwind": "$user_details"},
        {"$addFields": {
            "user": {
                "_id": "$user_details._id",
                "username": "$user_details.username",
                "full_name": "$user_details.full_name",
                "avatar": "$user_details.avatar"
            }
        }},
        {"$project": { "user_details": 0, "user.password_hash": 0 }}
    ]
    posts = list(posts_collection.aggregate(pipeline))

    # Use the deep_serialize_objectid helper to recursively convert all ObjectIds to strings
    # This handles all nested structures and custom objects
    serialized_posts = []
    for post in posts:
        serialized_post = deep_serialize_objectid(post)
        serialized_posts.append(serialized_post)

    return serialized_posts

def like_post(post_id, user_id, socketio=None):
    posts_collection = get_posts_collection()

    # Handle both string and ObjectId inputs
    try:
        user_oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id
    except:
        user_oid = user_id  # Keep as string if not a valid ObjectId

    # Look up post by UUID id field instead of MongoDB _id
    post = posts_collection.find_one({"id": post_id})
    if not post:
        return None

    # Convert existing likes to ObjectIds for comparison
    existing_likes = []
    for like in post.get("likes", []):
        if isinstance(like, str):
            try:
                existing_likes.append(ObjectId(like))
            except:
                existing_likes.append(like)
        else:
            existing_likes.append(like)

    if user_oid in existing_likes:
        # User has already liked the post, so unlike it
        result = posts_collection.update_one({"id": post_id}, {"$pull": {"likes": user_oid}})
    else:
        # User has not liked the post, so like it
        result = posts_collection.update_one({"id": post_id}, {"$addToSet": {"likes": user_oid}})

    if result.modified_count > 0:
        updated_post = posts_collection.find_one({"id": post_id})
        if updated_post and socketio:
            socketio.emit('post_update', {
                "post_id": post_id,
                "likes": len(updated_post.get('likes', []))
            })
        return get_post(post_id)
    return None

def add_comment(post_id, text, user_id, socketio=None):
    posts_collection = get_posts_collection()

    # Handle both string and ObjectId inputs
    try:
        user_oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id
    except:
        user_oid = user_id  # Keep as string if not a valid ObjectId

    # Look up post by UUID id field instead of MongoDB _id
    post = posts_collection.find_one({"id": post_id})
    if not post:
        return None

    comment = {
        "_id": ObjectId(),
        "user_id": user_oid,
        "text": text,
        "created_at": datetime.utcnow()
    }

    result = posts_collection.update_one({"id": post_id}, {"$push": {"comments": comment}})

    if result.modified_count > 0:
        user_info = get_db().users.find_one({"_id": user_oid}, {"password_hash": 0})
        if user_info:
            comment['user'] = {
                "_id": str(user_info["_id"]),
                "username": user_info.get("username"),
                "full_name": user_info.get("full_name"),
                "avatar": user_info.get("avatar")
            }
        comment['_id'] = str(comment['_id'])
        comment['user_id'] = str(comment['user_id'])

        if socketio:
            socketio.emit('comment_update', {"post_id": post_id, "comment": comment})

        return get_post(post_id)
    return None

def get_post(post_id):
    posts_collection = get_posts_collection()
    pipeline = [
        {"$match": {"id": post_id}},
        {"$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "_id",
            "as": "user_details"
        }},
        {"$unwind": "$user_details"},
        {"$addFields": {
            "user": {
                "_id": "$user_details._id",
                "username": "$user_details.username",
                "full_name": "$user_details.full_name",
                "avatar": "$user_details.avatar"
            }
        }},
        {"$project": { "user_details": 0, "user.password_hash": 0 }}
    ]
    post_agg = list(posts_collection.aggregate(pipeline))

    if post_agg:
        post = post_agg[0]
        # Use the deep_serialize_objectid helper to recursively convert all ObjectIds to strings
        # This handles all nested structures and custom objects
        serialized_post = deep_serialize_objectid(post)
        return serialized_post
    return None

def delete_post(post_id: str, user_id: str, socketio=None):
    posts_collection = get_posts_collection()

    # Handle both string and ObjectId inputs
    try:
        user_oid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id
    except:
        user_oid = user_id  # Keep as string if not a valid ObjectId

    # Look up post by UUID id field instead of MongoDB _id
    post_to_delete = posts_collection.find_one({"id": post_id, "user_id": user_oid})

    if not post_to_delete:
        return False

    result = posts_collection.delete_one({"id": post_id})

    if result.deleted_count > 0:
        if post_to_delete.get("media_url"):
            try:
                UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
                filename = os.path.basename(post_to_delete["media_url"])
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Error deleting file for post {post_id}: {e}")

        if socketio:
            socketio.emit('post_deleted', {'post_id': post_id})
        return True
    return False
