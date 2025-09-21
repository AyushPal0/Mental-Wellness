#!/usr/bin/env python3
"""
Comprehensive API Testing Script for Mental Wellness Backend
Tests all endpoints systematically with proper error handling
"""

import requests
import json
import time
from datetime import datetime

class APITester:
    def __init__(self, base_url="http://127.0.0.1:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_user_id = None
        self.test_post_id = None
        self.test_task_id = None

    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] [{status}] {message}")

    def test_endpoint(self, method, endpoint, data=None, headers=None, description=""):
        """Test a single endpoint with proper error handling"""
        url = f"{self.base_url}{endpoint}"
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

            if response.status_code in [200, 201]:
                try:
                    response_data = response.json()
                    self.log(f"Response: {json.dumps(response_data, indent=2)}")
                    return response_data
                except:
                    self.log(f"Response (raw): {response.text}")
                    return response.text
            else:
                self.log(f"Error Response: {response.text}", "ERROR")
                return None

        except requests.exceptions.RequestException as e:
            self.log(f"Request failed: {str(e)}", "ERROR")
            return None

    def test_health_endpoints(self):
        """Test basic health and status endpoints"""
        self.log("=== TESTING HEALTH ENDPOINTS ===")

        # Test main health endpoint
        self.test_endpoint("GET", "/", description="Main health check")

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
        if result and "userId" in result:
            self.test_user_id = result["userId"]

        # Test login
        login_data = {
            "email": signup_data["email"],
            "password": signup_data["password"]
        }

        result = self.test_endpoint("POST", "/api/login", login_data, description="User login")
        if result and "userId" in result:
            self.test_user_id = result["userId"]

        # Test get user profile
        if self.test_user_id:
            self.test_endpoint("GET", f"/api/user/{self.test_user_id}", description="Get user profile")

        # Test user search
        self.test_endpoint("GET", "/api/users/search?q=test", description="Search users")

    def test_chat_endpoints(self):
        """Test chat-related endpoints"""
        self.log("=== TESTING CHAT ENDPOINTS ===")

        # Test chat endpoint
        chat_data = {
            "message": "Hello, how are you?",
            "user_id": self.test_user_id or "test_user"
        }

        self.test_endpoint("POST", "/api/chat", chat_data, description="Send chat message")

        # Test chat history
        if self.test_user_id:
            self.test_endpoint("GET", f"/api/chat/history/{self.test_user_id}", description="Get chat history")

    def test_community_endpoints(self):
        """Test community-related endpoints"""
        self.log("=== TESTING COMMUNITY ENDPOINTS ===")

        # Test get posts
        self.test_endpoint("GET", "/api/community/posts", description="Get community posts")

        # Test create post (using form data instead of JSON)
        try:
            self.log("Testing POST /api/community/posts - Create community post")
            url = f"{self.base_url}/api/community/posts"
            post_data = {
                "content": "This is a test post for API testing",
                "user_id": self.test_user_id or "test_user"
            }
            response = self.session.post(url, data=post_data, timeout=10)
            self.log(f"Status Code: {response.status_code}")

            if response.status_code in [200, 201]:
                try:
                    response_data = response.json()
                    self.log(f"Response: {json.dumps(response_data, indent=2)}")
                    if response_data.get("status") == "success" and "post" in response_data:
                        post_info = response_data["post"]
                        self.test_post_id = post_info.get("id") or post_info.get("_id")
                except:
                    self.log(f"Response (raw): {response.text}")
            else:
                self.log(f"Error Response: {response.text}", "ERROR")
        except requests.exceptions.RequestException as e:
            self.log(f"Request failed: {str(e)}", "ERROR")

        # Test like post (if we have a post ID)
        if self.test_post_id:
            like_data = {"user_id": self.test_user_id or "test_user"}
            self.test_endpoint("POST", f"/api/community/posts/{self.test_post_id}/like", like_data, description="Like post")

        # Test comment on post (if we have a post ID)
        if self.test_post_id:
            comment_data = {
                "text": "This is a test comment",
                "user_id": self.test_user_id or "test_user"
            }
            self.test_endpoint("POST", f"/api/community/posts/{self.test_post_id}/comment", comment_data, description="Comment on post")

    def test_friends_endpoints(self):
        """Test friends-related endpoints"""
        self.log("=== TESTING FRIENDS ENDPOINTS ===")

        # Test search users (with userId parameter)
        if self.test_user_id:
            self.test_endpoint("GET", f"/api/friends/search?q=test&userId={self.test_user_id}", description="Search friends")
        else:
            self.test_endpoint("GET", "/api/friends/search?q=test&userId=test_user", description="Search friends")

        # Test send friend request
        if self.test_user_id:
            friend_request_data = {
                "from_user_id": self.test_user_id,
                "to_user_id": "some_other_user_id"  # This might fail, but that's expected
            }
            self.test_endpoint("POST", "/api/friends/friend-request", friend_request_data, description="Send friend request")

        # Test get friends
        if self.test_user_id:
            self.test_endpoint("GET", f"/api/friends/friends/{self.test_user_id}", description="Get user friends")

        # Test get friend requests
        if self.test_user_id:
            self.test_endpoint("GET", f"/api/friends/friend-requests/{self.test_user_id}", description="Get friend requests")

    def test_task_endpoints(self):
        """Test task-related endpoints"""
        self.log("=== TESTING TASK ENDPOINTS ===")

        # Test create task
        task_data = {
            "title": "Test Task for API Testing",
            "description": "This is a test task created during API testing",
            "user_id": self.test_user_id or "test_user",
            "priority": "medium",
            "category": "wellness"
        }

        result = self.test_endpoint("POST", "/api/tasks", task_data, description="Create task")
        if result and "task_id" in result:
            self.test_task_id = result["task_id"]

        # Test get tasks for user
        if self.test_user_id:
            self.test_endpoint("GET", f"/api/tasks/user/{self.test_user_id}", description="Get user tasks")

        # Test get specific task
        if self.test_task_id:
            self.test_endpoint("GET", f"/api/tasks/{self.test_task_id}", description="Get specific task")

        # Test AI suggestion
        if self.test_user_id:
            self.test_endpoint("GET", f"/api/tasks/ai-suggestion/{self.test_user_id}", description="Get AI task suggestions")

    def test_game_endpoints(self):
        """Test game-related endpoints"""
        self.log("=== TESTING GAME ENDPOINTS ===")

        # Test start game session
        game_start_data = {
            "level": 0
        }
        self.test_endpoint("POST", "/api/game/start", game_start_data, description="Start game session")

        # Test record game action
        game_action_data = {
            "session_id": "test_session",
            "item_id": "test_item",
            "action_type": "move",
            "start_position": {"x": 0, "y": 0},
            "end_position": {"x": 100, "y": 100},
            "time_taken": 1.5,
            "timestamp": time.time()
        }
        self.test_endpoint("POST", "/api/game/action", game_action_data, description="Record game action")

        # Test check placement
        placement_data = {
            "id": "test_item",
            "x": 100,
            "y": 100,
            "rotation": 0
        }
        self.test_endpoint("POST", "/api/game/check-placement", placement_data, description="Check game placement")

        # Test complete level
        complete_data = {
            "session_id": "test_session",
            "level": 0,
            "items": [{"id": "test_item", "x": 100, "y": 100, "rotation": 0}],
            "completion_time": 60,
            "corrections": 2
        }
        self.test_endpoint("POST", "/api/game/complete", complete_data, description="Complete game level")

        # Test get leaderboard
        self.test_endpoint("GET", "/api/game/leaderboard", description="Get game leaderboard")

    def test_personality_endpoints(self):
        """Test personality test endpoints"""
        self.log("=== TESTING PERSONALITY ENDPOINTS ===")

        # Test get questions
        self.test_endpoint("GET", "/api/personality/questions", description="Get personality questions")

        # Test submit personality test
        personality_data = {
            "user_id": self.test_user_id or "test_user",
            "scores": {
                "I": 12, "E": 8, "N": 14, "S": 6,
                "T": 10, "F": 10, "J": 11, "P": 9
            }
        }
        self.test_endpoint("POST", "/api/personality/submit", personality_data, description="Submit personality test")

    def test_home_endpoints(self):
        """Test home/dashboard endpoints"""
        self.log("=== TESTING HOME ENDPOINTS ===")

        if self.test_user_id:
            self.test_endpoint("GET", f"/api/home/{self.test_user_id}", description="Get home dashboard data")

    def test_safety_endpoints(self):
        """Test safety-related endpoints"""
        self.log("=== TESTING SAFETY ENDPOINTS ===")

        # Test risk event reporting
        risk_data = {
            "user_id": self.test_user_id or "test_user",
            "risk_level": "low",
            "message": "This is a test risk event for API testing"
        }
        self.test_endpoint("POST", "/api/safety/risk-event", risk_data, description="Report risk event")

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        self.log("=== TESTING ERROR HANDLING ===")

        # Test 404 endpoint
        self.test_endpoint("GET", "/api/nonexistent", description="Test 404 error")

        # Test invalid auth data
        self.test_endpoint("POST", "/api/login", {"email": "invalid"}, description="Test invalid login data")

        # Test invalid signup data
        self.test_endpoint("POST", "/api/signup", {"email": "invalid"}, description="Test invalid signup data")

    def run_all_tests(self):
        """Run all API tests in sequence"""
        self.log("🚀 STARTING COMPREHENSIVE API TESTING")
        self.log(f"Target URL: {self.base_url}")

        try:
            self.test_health_endpoints()
            self.test_auth_endpoints()
            self.test_chat_endpoints()
            self.test_community_endpoints()
            self.test_friends_endpoints()
            self.test_task_endpoints()
            self.test_game_endpoints()
            self.test_personality_endpoints()
            self.test_home_endpoints()
            self.test_safety_endpoints()
            self.test_error_handling()

            self.log("✅ API TESTING COMPLETED")
            self.log("📊 SUMMARY:")
            self.log(f"   - Test User ID: {self.test_user_id}")
            self.log(f"   - Test Post ID: {self.test_post_id}")
            self.log(f"   - Test Task ID: {self.test_task_id}")

        except Exception as e:
            self.log(f"❌ Testing failed with error: {str(e)}", "ERROR")

def main():
    tester = APITester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()
