#!/usr/bin/env python3
"""
Comprehensive API Testing Script for Mental Wellness Backend
Tests all endpoints systematically with proper error handling and detailed reporting
"""

import requests
import json
import time
from datetime import datetime
import sys
import os

class APITester:
    def __init__(self, base_url="http://127.0.0.1:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_user_id = None
        self.test_post_id = None
        self.test_task_id = None
        self.results = {
            'total_tests': 0,
            'passed_tests': 0,
            'failed_tests': 0,
            'endpoints': {}
        }

    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] [{status}] {message}")

    def test_endpoint(self, method, endpoint, data=None, headers=None, description="", expected_status=200):
        """Test a single endpoint with proper error handling and detailed reporting"""
        url = f"{self.base_url}{endpoint}"
        self.results['total_tests'] += 1

        try:
            self.log(f"Testing {method} {endpoint} - {description}")

            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, timeout=10)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=10)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=headers, timeout=10)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers, timeout=10)
            else:
                self.log(f"Unsupported method: {method}", "ERROR")
                return None

            self.log(f"Status Code: {response.status_code}")

            if response.status_code in [expected_status, 201]:
                try:
                    response_data = response.json()
                    self.log(f"✅ PASSED - Response: {json.dumps(response_data, indent=2)}")
                    self.results['passed_tests'] += 1
                    self.results['endpoints'][endpoint] = {'status': 'PASSED', 'response': response_data}
                    return response_data
                except:
                    self.log(f"✅ PASSED - Response (raw): {response.text}")
                    self.results['passed_tests'] += 1
                    self.results['endpoints'][endpoint] = {'status': 'PASSED', 'response': response.text}
                    return response.text
            else:
                self.log(f"❌ FAILED - Error Response: {response.text}", "ERROR")
                self.results['failed_tests'] += 1
                self.results['endpoints'][endpoint] = {'status': 'FAILED', 'response': response.text}
                return None

        except requests.exceptions.RequestException as e:
            self.log(f"❌ FAILED - Request failed: {str(e)}", "ERROR")
            self.results['failed_tests'] += 1
            self.results['endpoints'][endpoint] = {'status': 'FAILED', 'error': str(e)}
            return None

    def test_health_endpoints(self):
        """Test basic health and status endpoints"""
        self.log("=== TESTING HEALTH ENDPOINTS ===")

        # Test main health endpoint
        self.test_endpoint("GET", "/", description="Main health check endpoint")

        # Test 404 endpoint
        self.test_endpoint("GET", "/api/nonexistent", description="Test 404 error", expected_status=404)

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        self.log("=== TESTING AUTH ENDPOINTS ===")

        # Test signup
        signup_data = {
            "email": f"testuser_{int(time.time())}@example.com",
            "password": "testpass123",
            "firstname": "Test",
            "lastname": "User"
        }
        result = self.test_endpoint("POST", "/api/signup", signup_data, description="User signup")
        if result and 'userId' in result:
            self.test_user_id = result['userId']

        # Test login
        login_data = {
            "email": signup_data["email"],
            "password": signup_data["password"]
        }
        result = self.test_endpoint("POST", "/api/login", login_data, description="User login")

        # Test invalid login
        self.test_endpoint("POST", "/api/login", {"email": "invalid"}, description="Test invalid login data", expected_status=400)

        # Test invalid signup
        self.test_endpoint("POST", "/api/signup", {"email": "invalid"}, description="Test invalid signup data", expected_status=400)

        # Test user profile (if we have a user ID)
        if self.test_user_id:
            self.test_endpoint("GET", f"/api/user/{self.test_user_id}", description="Get user profile")

        # Test user search
        self.test_endpoint("GET", "/api/users/search?q=test", description="Search users")

    def test_community_endpoints(self):
        """Test community endpoints"""
        self.log("=== TESTING COMMUNITY ENDPOINTS ===")

        # Test get posts
        result = self.test_endpoint("GET", "/api/community/posts", description="Get all posts")

        # Test create post (if we have a user ID)
        if self.test_user_id:
            # Send as form data instead of JSON
            post_data = {
                "user_id": self.test_user_id,
                "content": "This is a test post for API testing"
            }
            result = self.test_endpoint("POST", "/api/community/posts", post_data, description="Create new post")
            if result and 'post' in result and 'id' in result['post']:
                self.test_post_id = result['post']['id']

        # Test like post (if we have post and user IDs)
        if self.test_post_id and self.test_user_id:
            # Use the UUID id field instead of MongoDB _id
            post_uuid = self.test_post_id.get('id') if isinstance(self.test_post_id, dict) else self.test_post_id
            like_data = {"user_id": self.test_user_id}
            self.test_endpoint("POST", f"/api/community/posts/{post_uuid}/like", like_data, description="Like a post")

        # Test comment on post (if we have post and user IDs)
        if self.test_post_id and self.test_user_id:
            # Use the UUID id field instead of MongoDB _id
            post_uuid = self.test_post_id.get('id') if isinstance(self.test_post_id, dict) else self.test_post_id
            comment_data = {
                "text": "This is a test comment",
                "user_id": self.test_user_id
            }
            self.test_endpoint("POST", f"/api/community/posts/{post_uuid}/comment", comment_data, description="Comment on a post")

    def test_task_endpoints(self):
        """Test task endpoints"""
        self.log("=== TESTING TASK ENDPOINTS ===")

        # Test AI suggestion (if we have a user ID)
        if self.test_user_id:
            self.test_endpoint("GET", f"/api/tasks/ai-suggestion/{self.test_user_id}", description="Get AI task suggestion")

        # Test create task (if we have a user ID)
        if self.test_user_id:
            task_data = {
                "title": "Test Task for API Testing",
                "user_id": self.test_user_id,
                "description": "This is a test task created during API testing"
            }
            result = self.test_endpoint("POST", "/api/tasks", task_data, description="Create new task")
            if result and '_id' in result:
                self.test_task_id = result['_id']

        # Test get tasks for user (if we have a user ID)
        if self.test_user_id:
            self.test_endpoint("GET", f"/api/tasks/user/{self.test_user_id}", description="Get user tasks")

        # Test get specific task (if we have a task ID)
        if self.test_task_id:
            self.test_endpoint("GET", f"/api/tasks/{self.test_task_id}", description="Get specific task")

    def test_friends_endpoints(self):
        """Test friends endpoints"""
        self.log("=== TESTING FRIENDS ENDPOINTS ===")

        # Test search users
        self.test_endpoint("GET", "/api/friends/search?q=test", description="Search for friends")

        # Test get friends (if we have a user ID)
        if self.test_user_id:
            self.test_endpoint("GET", f"/api/friends/friends/{self.test_user_id}", description="Get user friends")

    def test_game_endpoints(self):
        """Test game endpoints"""
        self.log("=== TESTING GAME ENDPOINTS ===")

        # Test game start (if we have a user ID)
        if self.test_user_id:
            game_data = {"user_id": self.test_user_id}
            self.test_endpoint("POST", "/api/game/start", game_data, description="Start new game")

    def test_home_endpoints(self):
        """Test home endpoints"""
        self.log("=== TESTING HOME ENDPOINTS ===")

        # Test home dashboard (if we have a user ID)
        if self.test_user_id:
            self.test_endpoint("GET", f"/api/home/{self.test_user_id}", description="Get home dashboard")

    def test_safety_endpoints(self):
        """Test safety endpoints"""
        self.log("=== TESTING SAFETY ENDPOINTS ===")

        # Test risk event reporting
        risk_data = {
            "user_id": self.test_user_id or "test_user",
            "risk_level": "low",
            "message": "This is a test risk event for API testing"
        }
        self.test_endpoint("POST", "/api/safety/risk-event", risk_data, description="Report risk event")

    def test_personality_endpoints(self):
        """Test personality endpoints"""
        self.log("=== TESTING PERSONALITY ENDPOINTS ===")

        # Test get questions
        self.test_endpoint("GET", "/api/personality/questions", description="Get personality test questions")

        # Test submit personality (if we have a user ID)
        if self.test_user_id:
            personality_data = {
                "user_id": self.test_user_id,
                "scores": {
                    "I": 12, "E": 8,
                    "N": 14, "S": 6,
                    "T": 10, "F": 10,
                    "J": 11, "P": 9
                }
            }
            self.test_endpoint("POST", "/api/personality/submit", personality_data, description="Submit personality test")

    def generate_report(self):
        """Generate a comprehensive test report"""
        self.log("\n" + "="*60)
        self.log("📊 COMPREHENSIVE API TEST REPORT")
        self.log("="*60)

        self.log(f"Total Tests Run: {self.results['total_tests']}")
        self.log(f"✅ Tests Passed: {self.results['passed_tests']}")
        self.log(f"❌ Tests Failed: {self.results['failed_tests']}")
        success_rate = (self.results['passed_tests']/self.results['total_tests']*100) if self.results['total_tests'] > 0 else 0
        self.log(f"📈 Success Rate: {success_rate:.1f}%")
        self.log("\n" + "-"*60)
        self.log("ENDPOINT STATUS SUMMARY:")
        self.log("-"*60)

        for endpoint, result in self.results['endpoints'].items():
            status = result['status']
            self.log(f"{'✅' if status == 'PASSED' else '❌'} {endpoint}: {status}")

        # Save detailed report to file
        report_file = f"api_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(self.results, f, indent=2)
        self.log(f"\n💾 Detailed report saved to: {report_file}")

    def run_all_tests(self):
        """Run all API tests in sequence"""
        self.log("🚀 STARTING COMPREHENSIVE API TESTING")
        self.log(f"Target URL: {self.base_url}")
        self.log("="*60)

        try:
            self.test_health_endpoints()
            self.test_auth_endpoints()
            self.test_community_endpoints()
            self.test_task_endpoints()
            self.test_friends_endpoints()
            self.test_game_endpoints()
            self.test_home_endpoints()
            self.test_safety_endpoints()
            self.test_personality_endpoints()

            self.generate_report()

            self.log("✅ API TESTING COMPLETED")
            self.log("📊 SUMMARY:")
            self.log(f"   - Test User ID: {self.test_user_id}")
            self.log(f"   - Test Post ID: {self.test_post_id}")
            self.log(f"   - Test Task ID: {self.test_task_id}")

        except Exception as e:
            self.log(f"❌ Testing failed with error: {str(e)}", "ERROR")
            import traceback
            traceback.print_exc()

def main():
    # Check if server is running
    try:
        response = requests.get("http://127.0.0.1:5000/", timeout=5)
        print("✅ Server is running!")
    except:
        print("❌ Server is not running! Please start the server first.")
        print("Run: python Backend/app_final.py")
        return

    tester = APITester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()
