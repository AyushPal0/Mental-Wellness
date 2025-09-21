#!/usr/bin/env python3
"""
Migration script to fix ObjectId serialization issues in existing posts.
This script converts all ObjectIds in likes and comments arrays to strings.
"""

from utils.db import get_db
from bson.objectid import ObjectId
import sys

def fix_existing_posts():
    """Fix existing posts by converting ObjectIds to strings in likes and comments"""
    try:
        db = get_db()
        posts_collection = db.posts

        # Find all posts that have ObjectIds in likes or comments
        posts_to_fix = list(posts_collection.find({
            "$or": [
                {"likes": {"$type": "objectId"}},
                {"comments.user_id": {"$type": "objectId"}},
                {"comments._id": {"$type": "objectId"}}
            ]
        }))

        print(f"Found {len(posts_to_fix)} posts that need fixing")

        for post in posts_to_fix:
            updates = {}

            # Fix likes array
            if 'likes' in post and post['likes']:
                fixed_likes = []
                for like in post['likes']:
                    if isinstance(like, ObjectId):
                        fixed_likes.append(str(like))
                    else:
                        fixed_likes.append(like)
                updates['likes'] = fixed_likes

            # Fix comments array
            if 'comments' in post and post['comments']:
                fixed_comments = []
                for comment in post['comments']:
                    fixed_comment = comment.copy()
                    if 'user_id' in fixed_comment and isinstance(fixed_comment['user_id'], ObjectId):
                        fixed_comment['user_id'] = str(fixed_comment['user_id'])
                    if '_id' in fixed_comment and isinstance(fixed_comment['_id'], ObjectId):
                        fixed_comment['_id'] = str(fixed_comment['_id'])
                    fixed_comments.append(fixed_comment)
                updates['comments'] = fixed_comments

            if updates:
                result = posts_collection.update_one(
                    {"_id": post["_id"]},
                    {"$set": updates}
                )
                print(f"Fixed post {post.get('id', post['_id'])}: {result.modified_count} document(s) modified")

        print("Migration completed successfully!")
        return True

    except Exception as e:
        print(f"Error during migration: {str(e)}")
        return False

if __name__ == "__main__":
    print("Starting ObjectId migration...")
    success = fix_existing_posts()
    if success:
        print("✅ Migration completed successfully!")
        sys.exit(0)
    else:
        print("❌ Migration failed!")
        sys.exit(1)
