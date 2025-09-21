#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.community_service import get_all_posts, deep_serialize_objectid
from utils.db import get_db
from bson.objectid import ObjectId

def debug_posts():
    try:
        print("🔍 DEBUGGING POSTS...")

        # Check if we can connect to database
        db = get_db()
        print(f"✅ Database connection: {db.name}")

        # Get posts
        posts = get_all_posts()
        print(f"📝 Found {len(posts)} posts")

        if posts:
            print("📋 First post structure:")
            first_post = posts[0]
            print(f"Type: {type(first_post)}")
            print(f"Keys: {list(first_post.keys()) if isinstance(first_post, dict) else 'Not a dict'}")

            # Check for ObjectIds
            def find_objectids(obj, path=""):
                if isinstance(obj, ObjectId):
                    print(f"❌ Found ObjectId at {path}: {obj}")
                    return True
                elif isinstance(obj, dict):
                    for key, value in obj.items():
                        if find_objectids(value, f"{path}.{key}"):
                            return True
                elif isinstance(obj, list):
                    for i, item in enumerate(obj):
                        if find_objectids(item, f"{path}[{i}]"):
                            return True
                return False

            has_objectids = find_objectids(first_post)
            if not has_objectids:
                print("✅ No ObjectIds found in first post")

            # Test serialization
            print("\n🧪 Testing serialization...")
            serialized = deep_serialize_objectid(first_post)
            print(f"✅ Serialization successful: {type(serialized)}")

            # Check again for ObjectIds after serialization
            has_objectids_after = find_objectids(serialized)
            if not has_objectids_after:
                print("✅ No ObjectIds found after serialization")
            else:
                print("❌ Still found ObjectIds after serialization")

        else:
            print("⚠️ No posts found in database")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_posts()
