#!/usr/bin/env python3

import requests
import json

def test_get_posts():
    try:
        print("🧪 Testing GET /api/community/posts endpoint...")

        response = requests.get("http://127.0.0.1:5000/api/community/posts")

        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")

        if response.status_code == 200:
            try:
                data = response.json()
                print("✅ Success! Response:")
                print(json.dumps(data, indent=2))
            except json.JSONDecodeError as e:
                print(f"❌ JSON decode error: {e}")
                print(f"Raw response: {response.text[:500]}")
        else:
            print(f"❌ Error response: {response.status_code}")
            print(f"Response: {response.text}")

    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_get_posts()
