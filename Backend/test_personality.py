import requests
import json

# Test the personality endpoints
base_url = "http://127.0.0.1:5000"

print("Testing Personality Endpoints")
print("=" * 40)

# Test GET /api/personality/questions
try:
    print("\n1. Testing GET /api/personality/questions")
    response = requests.get(f"{base_url}/api/personality/questions")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("✅ Questions endpoint working!")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"❌ Questions endpoint failed: {response.text}")
except Exception as e:
    print(f"❌ Error testing questions endpoint: {e}")

# Test POST /api/personality/submit
try:
    print("\n2. Testing POST /api/personality/submit")
    test_data = {
        "user_id": "test_user_123",
        "scores": {
            "I": 12, "E": 8,
            "N": 14, "S": 6,
            "T": 10, "F": 10,
            "J": 11, "P": 9
        }
    }
    response = requests.post(f"{base_url}/api/personality/submit", json=test_data)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("✅ Submit endpoint working!")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"❌ Submit endpoint failed: {response.text}")
except Exception as e:
    print(f"❌ Error testing submit endpoint: {e}")
