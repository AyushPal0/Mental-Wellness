#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_route_directly():
    try:
        print("🧪 Testing route handler directly...")

        # Import the route handler
        from routes.community_routes import get_posts_route
        from flask import Flask

        # Create a minimal Flask app for testing
        app = Flask(__name__)

        # Add the blueprint to the app
        from routes.community_routes import community_bp
        app.register_blueprint(community_bp, url_prefix="/api/community")

        # Create a test request context
        with app.test_request_context('/api/community/posts', method='GET'):
            print("✅ Created test request context")

            # Call the route handler directly
            try:
                result = get_posts_route()
                print(f"✅ Route handler completed: {result}")
            except Exception as e:
                print(f"❌ Route handler failed: {e}")
                import traceback
                traceback.print_exc()

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_route_directly()
