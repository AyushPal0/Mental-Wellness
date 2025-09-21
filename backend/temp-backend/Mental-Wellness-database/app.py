import os
import sys
import logging
import json
from flask import Flask, jsonify, send_from_directory
from flask.json.provider import JSONProvider
from flask_cors import CORS
from dotenv import load_dotenv

# Import the shared socketio instance from the new extensions file
from extensions import socketio
from utils.json_encoder import MongoJSONEncoder

# Load environment variables first
load_dotenv()

# Set up Python import paths
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import blueprints
from routes.auth_routes import auth_bp
from routes.chat_routes import chat_bp
from routes.community_routes import community_bp
from routes.friends_routes import friends_bp
from routes.home_routes import home_bp
from routes.task_routes import task_bp
from routes.safety_routes import safety_bp
from routes.personality_routes import personality_bp
from routes.game_routes import game_bp
from routes.onboarding_routes import onboarding_bp

# Custom JSON Provider class
class CustomJSONProvider(JSONProvider):
    def dumps(self, obj, **kwargs):
        return json.dumps(obj, **kwargs, cls=MongoJSONEncoder)

    def loads(self, s, **kwargs):
        return json.loads(s, **kwargs)

class MentalWellnessApp:
    def __init__(self):
        self.app = Flask(__name__)
        self.app.json = CustomJSONProvider(self.app)
        
        # REMOVED: self.socketio = SocketIO(self.app, cors_allowed_origins="*")

        self.initialization_status = {
            'mongodb': False,
            'auth_routes': False,
            'chat_routes': False,
            'community_routes': False,
            'friends_routes': False,
            'home_routes': False,
            'task_routes': False,
            'safety_routes': False,
            'personality_routes': False,
            'game_routes': False,
            'onboarding_routes': False,
        }
        
        self.setup_logging()
        self.setup_cors()
        self.setup_database()
        
        # Initialize SocketIO with the app instance here
        socketio.init_app(self.app)

        self.register_blueprints()
        self.setup_health_routes()
        self.setup_error_handlers()
        self.setup_static_file_serving()

    def setup_logging(self):
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger(__name__)

    def setup_cors(self):
        CORS(self.app)

    def setup_database(self):
        try:
            self.logger.info("🔄 Initializing MongoDB connection...")
            from utils.db import get_db
            get_db()
            self.initialization_status['mongodb'] = True
            self.logger.info("✅ MongoDB initialized successfully")
        except Exception as e:
            self.logger.error(f"❌ MongoDB initialization failed: {e}")

    def register_blueprints(self):
        blueprints = {
            'auth_routes': (auth_bp, "/api"),
            'chat_routes': (chat_bp, "/api"),
            'community_routes': (community_bp, "/api/community"),
            'friends_routes': (friends_bp, "/api/friends"),
            'home_routes': (home_bp, "/api"),
            'task_routes': (task_bp, "/api"),
            'safety_routes': (safety_bp, "/api/safety"),
            'personality_routes': (personality_bp, "/api/personality"),
            'game_routes': (game_bp, "/api/game"),
            'onboarding_routes': (onboarding_bp, "/api/onboarding"),
        }

        for name, (bp, prefix) in blueprints.items():
            try:
                # REMOVED the logic to pass socketio to the blueprint
                self.app.register_blueprint(bp, url_prefix=prefix)
                self.initialization_status[name] = True
                self.logger.info(f"✅ {name.replace('_', ' ').title()} registered")
            except Exception as e:
                self.logger.error(f"❌ {name.replace('_', ' ').title()} registration failed: {e}")

    def setup_health_routes(self):
        @self.app.route("/")
        def home():
            return jsonify({
                "message": "Mental Wellness Backend is running 🚀",
                "status": "healthy",
                "initialization": self.initialization_status
            })

    def setup_error_handlers(self):
        @self.app.errorhandler(404)
        def not_found(error):
            return jsonify({"success": False, "error": "Endpoint not found"}), 404

        @self.app.errorhandler(500)
        def internal_error(error):
            self.logger.error(f"Internal Server Error: {error}")
            return jsonify({"success": False, "error": "Internal server error"}), 500

    def setup_static_file_serving(self):
        @self.app.route('/uploads/<filename>')
        def uploaded_file(filename):
            return send_from_directory(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads'), filename)

    def run(self):
        self.logger.info("🚀 Starting Mental Wellness Backend with real-time features...")
        self.logger.info("🌐 Server starting on http://127.0.0.1:5000")
        # Use the imported socketio instance to run the app
        socketio.run(self.app, debug=True, host="127.0.0.1", port=5000, use_reloader=False)

if __name__ == "__main__":
    app_instance = MentalWellnessApp()
    app = app_instance.app
    # The socketio instance is now managed within the class and extensions file
    app_instance.run()