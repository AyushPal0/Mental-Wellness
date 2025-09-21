# backend/services/community_service.py
from utils.db import get_db
from bson.objectid import ObjectId
from datetime import datetime
import os
from werkzeug.utils import secure_filename

# --- HELPER FUNCTION (no changes needed here) ---
def serialize_document(doc):
    """
    Recursively converts MongoDB ObjectIds and datetimes to strings.
    """
    if doc is None:
        return None
    
    if isinstance(doc, list):
        return [serialize_document(item) for item in doc]

    if isinstance(doc, dict):
        serialized_doc = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                serialized_doc[key] = str(value)
            elif isinstance(value, datetime):
                serialized_doc[key] = value.isoformat()
            elif isinstance(value, (dict, list)):
                serialized_doc[key] = serialize_document(value)
            else:
                serialized_doc[key] = value
        return serialized_doc
    
    return doc

# --- SERVICE FUNCTIONS ---

def get_db_collections():
    """Returns the posts and users collections."""
    db = get_db()
    return db.posts, db.users

def get_all_posts_with_user_data():
    """
    Fetches all posts and joins them with user data for the community feed.
    """
    posts_collection, users_collection = get_db_collections()
    
    pipeline = [
        {"$sort": {"createdAt": -1}},
        {"$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "_id",
            "as": "user_info"
        }},
        {"$unwind": {"path": "$user_info", "preserveNullAndEmptyArrays": True}},
        {"$lookup": {
            "from": "users",
            "localField": "comments.user_id",
            "foreignField": "_id",
            "as": "comment_users"
        }},
        {"$project": {
            "_id": 1, "user_id": 1, "content": 1, "imageUrl": 1,
            "createdAt": 1,
            "likes": {
                "$cond": {
                    "if": { "$isArray": "$likes" },
                    "then": "$likes",
                    "else": []
                }
            },
            "user": {
                "_id": "$user_info._id",
                "username": "$user_info.username",
                "full_name": "$user_info.full_name",
                "avatar": "$user_info.avatar"
            },
            "comments": {
                "$map": {
                    "input": "$comments",
                    "as": "comment",
                    "in": {
                        "$mergeObjects": [
                            "$$comment",
                            {
                                "user": {
                                    "$arrayElemAt": [
                                        {
                                            "$filter": {
                                                "input": "$comment_users",
                                                "as": "user",
                                                "cond": { "$eq": [ "$$user._id", "$$comment.user_id" ] }
                                            }
                                        },
                                        0
                                    ]
                                }
                            }
                        ]
                    }
                }
            }
        }}
    ]
    
    posts = list(posts_collection.aggregate(pipeline))
    # The custom JSON encoder will handle serialization for the HTTP response
    return posts

def create_post_service(user_id, content, media_file=None):
    posts_collection, _ = get_db_collections()
    media_url = None

    if media_file:
        UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        filename = secure_filename(media_file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        media_file.save(file_path)
        media_url = f"/uploads/{filename}"

    new_post = {
        "user_id": ObjectId(user_id),
        "content": content,
        "imageUrl": media_url,
        "likes": [],
        "comments": [],
        "createdAt": datetime.utcnow()
    }
    result = posts_collection.insert_one(new_post)
    
    # Fetch the newly created post with user data
    pipeline = [
        {"$match": {"_id": result.inserted_id}},
        {"$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "_id",
            "as": "user_info"
        }},
        {"$unwind": "$user_info"},
        {"$project": {
            "_id": 1, "user_id": 1, "content": 1, "imageUrl": 1,
            "createdAt": 1, "likes": 1, "comments": 1,
            "user": {
                "_id": "$user_info._id",
                "username": "$user_info.username",
                "full_name": "$user_info.full_name",
                "avatar": "$user_info.avatar"
            }
        }}
    ]
    
    created_post = list(posts_collection.aggregate(pipeline))[0]
    return serialize_document(created_post)


def delete_post_service(post_id, user_id):
    posts_collection, _ = get_db_collections()
    result = posts_collection.delete_one({"_id": ObjectId(post_id), "user_id": ObjectId(user_id)})
    return result.deleted_count > 0

def like_post_service(post_id, user_id):
    posts_collection, _ = get_db_collections()
    post = posts_collection.find_one({"_id": ObjectId(post_id)})
    
    if post:
        user_obj_id = ObjectId(user_id)
        if user_obj_id in post.get('likes', []):
            posts_collection.update_one({"_id": ObjectId(post_id)}, {"$pull": {"likes": user_obj_id}})
        else:
            posts_collection.update_one({"_id": ObjectId(post_id)}, {"$addToSet": {"likes": user_obj_id}})
        
        updated_post = posts_collection.find_one({"_id": ObjectId(post_id)})
        return [str(uid) for uid in updated_post.get('likes', [])]
    return None

def add_comment_service(post_id, user_id, text):
    posts_collection, users_collection = get_db_collections()
    
    # Create the comment sub-document to be inserted
    comment_to_insert = {
        "_id": ObjectId(),
        "user_id": ObjectId(user_id),
        "text": text,
        "created_at": datetime.utcnow()
    }
    
    # Update the database
    posts_collection.update_one(
        {"_id": ObjectId(post_id)},
        {"$push": {"comments": comment_to_insert}}
    )
    
    # Fetch user info to embed in the returned comment object
    user_info = users_collection.find_one(
        {"_id": ObjectId(user_id)},
        {"password_hash": 0}  # Exclude the password hash
    )
    
    # Construct the final comment object for the real-time update
    # and serialize it immediately.
    comment_for_emit = {
        "_id": str(comment_to_insert["_id"]),
        "user_id": str(comment_to_insert["user_id"]),
        "text": comment_to_insert["text"],
        "created_at": comment_to_insert["created_at"].isoformat(),
        # Serialize the user info here to avoid nested ObjectIds
        "user": serialize_document(user_info) 
    }

    return comment_for_emit