#!/usr/bin/env python3

import requests
import json

def test_single_post():
    try:
        print("🧪 Testing GET /api/community/posts/<post_id> endpoint...")

        # First, let's get all posts to find a valid post_id
        response = requests.get("http://localhost:5000/api/community/posts")
        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            posts = data.get("posts", [])

            if posts:
                post_id = posts[0].get("id")
                print(f"Found post ID: {post_id}")

                # Now test the single post endpoint
                single_response = requests.get(f"http://localhost:5000/api/community/posts/{post_id}")
                print(f"Single post status code: {single_response.status_code}")

                if single_response.status_code == 200:
                    single_data = single_response.json()
                    print("✅ Single post endpoint works!")
                    print(f"Post data: {json.dumps(single_data, indent=2)}")
                else:
                    print(f"❌ Single post endpoint failed: {single_response.text}")
            else:
                print("❌ No posts found")
        else:
            print(f"❌ Get all posts failed: {response.text}")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_single_post()
