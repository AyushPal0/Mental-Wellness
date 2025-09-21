# backend/services/friends_service.py
from utils.db import get_db
from bson.objectid import ObjectId

def get_users_collection():
    db = get_db()
    return db.users

def search_users(query, current_user_id):
    users_collection = get_users_collection()

    # Handle empty or invalid current_user_id
    exclude_user_id = None
    if current_user_id and current_user_id.strip():
        try:
            exclude_user_id = ObjectId(current_user_id)
        except:
            # If current_user_id is not a valid ObjectId, don't exclude anyone
            exclude_user_id = None

    query_filter = {
        "username": {"$regex": query, "$options": "i"}
    }

    # Only exclude user if we have a valid ObjectId
    if exclude_user_id:
        query_filter["_id"] = {"$ne": exclude_user_id}

    users = list(users_collection.find(query_filter, {"password_hash": 0}))
    for user in users:
        user["_id"] = str(user["_id"])
    return users

def send_friend_request(from_user_id, to_user_id):
    users_collection = get_users_collection()

    # Handle both string and ObjectId inputs
    try:
        from_user_oid = ObjectId(from_user_id) if not isinstance(from_user_id, ObjectId) else from_user_id
    except:
        from_user_oid = from_user_id  # Keep as string if not a valid ObjectId

    try:
        to_user_oid = ObjectId(to_user_id) if not isinstance(to_user_id, ObjectId) else to_user_id
    except:
        to_user_oid = to_user_id  # Keep as string if not a valid ObjectId

    user_to = users_collection.find_one({"_id": to_user_oid})
    if not user_to:
        return False

    # Convert existing friends and requests to ObjectIds for comparison
    existing_friends = []
    for friend in user_to.get("friends", []):
        if isinstance(friend, str):
            try:
                existing_friends.append(ObjectId(friend))
            except:
                existing_friends.append(friend)
        else:
            existing_friends.append(friend)

    existing_requests = []
    for req in user_to.get("received_friend_requests", []):
        if isinstance(req, str):
            try:
                existing_requests.append(ObjectId(req))
            except:
                existing_requests.append(req)
        else:
            existing_requests.append(req)

    if from_user_oid in existing_friends or from_user_oid in existing_requests:
        return False

    users_collection.update_one({"_id": from_user_oid}, {"$addToSet": {"sent_friend_requests": to_user_oid}})
    users_collection.update_one({"_id": to_user_oid}, {"$addToSet": {"received_friend_requests": from_user_oid}})
    return True

def respond_to_friend_request(recipient_id, sender_id, action):
    users_collection = get_users_collection()

    # Handle both string and ObjectId inputs
    try:
        recipient_oid = ObjectId(recipient_id) if not isinstance(recipient_id, ObjectId) else recipient_id
    except:
        recipient_oid = recipient_id  # Keep as string if not a valid ObjectId

    try:
        sender_oid = ObjectId(sender_id) if not isinstance(sender_id, ObjectId) else sender_id
    except:
        sender_oid = sender_id  # Keep as string if not a valid ObjectId

    users_collection.update_one(
        {"_id": recipient_oid},
        {"$pull": {"received_friend_requests": sender_oid}}
    )
    users_collection.update_one(
        {"_id": sender_oid},
        {"$pull": {"sent_friend_requests": recipient_oid}}
    )

    if action == "accept":
        users_collection.update_one(
            {"_id": recipient_oid},
            {"$addToSet": {"friends": sender_oid}}
        )
        users_collection.update_one(
            {"_id": sender_oid},
            {"$addToSet": {"friends": recipient_oid}}
        )

    return True

def get_friends(user_id):
    users_collection = get_users_collection()
    user_oid = ObjectId(user_id)
    user = users_collection.find_one({"_id": user_oid}, {"friends": 1})
    if user and "friends" in user:
        friend_ids = user["friends"]
        friends = list(users_collection.find({"_id": {"$in": friend_ids}}, {"password_hash": 0}))
        for friend in friends:
            friend["_id"] = str(friend["_id"])
        return friends
    return []

def get_friend_requests(user_id):
    users_collection = get_users_collection()
    user_oid = ObjectId(user_id)
    user = users_collection.find_one({"_id": user_oid}, {"received_friend_requests": 1})
    if user and "received_friend_requests" in user:
        request_ids = user["received_friend_requests"]
        requests = list(users_collection.find({"_id": {"$in": request_ids}}, {"password_hash": 0}))
        for req in requests:
            req["_id"] = str(req["_id"])
        return requests
    return []