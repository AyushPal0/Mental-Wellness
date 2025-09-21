#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_flask_context():
    try:
        print("🧪 Testing community service within Flask app context...")

        # Import Flask app and create context
        from app_final import app
        from services.community_service import get_all_posts

        with app.app_context():
            print("✅ Created Flask app context")

            # Try to call get_all_posts within Flask context
            posts = get_all_posts()
            print(f"✅ get_all_posts() returned {len(posts)} posts")

            # Try to serialize using Flask's jsonify
            from flask import jsonify
            response = jsonify({"status": "success", "posts": posts})
            print("✅ Flask jsonify worked!")

            # Check the response data
            response_data = response.get_json()
            print(f"✅ Response data type: {type(response_data)}")
            print(f"✅ Response has {len(response_data.get('posts', []))} posts")

            print("✅ All tests passed!")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_flask_context()
