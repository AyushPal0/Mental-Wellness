#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_community_service():
    try:
        print("🧪 Testing community service import...")

        # Try to import the module
        from services.community_service import get_all_posts, deep_serialize_objectid
        print("✅ Successfully imported community_service functions")

        # Try to call get_all_posts
        print("🧪 Testing get_all_posts()...")
        posts = get_all_posts()
        print(f"✅ get_all_posts() returned {len(posts)} posts")

        # Try to serialize
        print("🧪 Testing deep_serialize_objectid()...")
        serialized = deep_serialize_objectid(posts)
        print(f"✅ deep_serialize_objectid() completed, type: {type(serialized)}")

        if serialized and len(serialized) > 0:
            print(f"✅ First post type: {type(serialized[0])}")
            if isinstance(serialized[0], dict):
                print(f"✅ First post keys: {list(serialized[0].keys())}")

        print("✅ All tests passed!")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_community_service()
