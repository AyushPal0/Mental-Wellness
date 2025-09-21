#!/usr/bin/env python3

import requests
import json

def test_simple_route():
    try:
        print("🧪 Testing simple route...")

        # Test a simple route first
        response = requests.get("http://localhost:5000/")
        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print("✅ Simple route works!")
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Simple route failed: {response.text}")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_simple_route()
