#!/usr/bin/env python3

import requests
import json

def test_direct_service():
    try:
        print("🧪 Testing direct service call through Flask...")

        # Test a simple route that calls the community service directly
        response = requests.get("http://localhost:5000/api/community/posts")
        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print("✅ Direct service call works!")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Direct service call failed: {response.text}")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_direct_service()
