import os
import sys
import logging
import codecs
import json
from flask import Flask, jsonify, request
from flask_cors import CORS

class MentalWellnessApp:
    def __init__(self):
        self.app = Flask(__name__)
        self.initialization_status = {
            'mongodb': False,
            'personality_routes': False,
            'task_routes': False,
            'task_service': False
        }
        self.setup_logging()
        self.setup_config()
        self.setup_import_paths()
        self.setup_cors()
        
    def setup_logging(self):
        """Configure logging settings"""
        if sys.stdout.encoding != 'utf-8':
            sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
        if sys.stderr.encoding != 'utf-8':
            sys.stderr = codecs.getwriter('utf-8')(sys.stderr.detach())
            
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(),
                logging.FileHandler('app.log', mode='w', encoding='utf-8')
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def setup_config(self):
        """Configure Flask app settings"""
        self.app.config['DEBUG'] = True
        
    def setup_import_paths(self):
        """Set up Python import paths"""
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        sys.path.insert(0, parent_dir)
        sys.path.insert(0, current_dir)
        
    def setup_cors(self):
        """Enable CORS for the app"""
        CORS(self.app)
        
    def check_required_files(self):
        """Check if all required files exist"""
        self.logger.info("🔍 Checking if required files exist...")
        base_dir = os.path.dirname(os.path.abspath(__file__))
        required_files = [
            'utils/db.py',
            'routes/personality_routes.py',
            'services/personality_service.py',
            'routes/task_routes.py',
            'services/task_service.py',
            'models/task.py',
            'questions/personality_questions.json'
        ]
        
        for file_path in required_files:
            abs_path = os.path.join(base_dir, file_path)
            if os.path.exists(abs_path):
                self.logger.info(f"✅ Found: {file_path}")
                if os.path.getsize(abs_path) == 0:
                    self.logger.warning(f"⚠️  File is empty: {file_path}")
            else:
                self.logger.warning(f"❌ Missing: {file_path}")
                
    def setup_database(self):
        """Initialize MongoDB connection"""
        try:
            self.logger.info("🔄 Attempting to import utils.db...")
            from utils.db import init_db
            init_db(self.app)
            self.initialization_status['mongodb'] = True
            self.logger.info("✅ MongoDB initialized successfully")
        except ImportError as e:
            self.logger.error(f"❌ MongoDB utils not found: {e}")
        except Exception as e:
            self.logger.error(f"❌ MongoDB initialization failed: {e}")
            
    def check_task_service(self):
        """Test task service import and functions"""
        try:
            self.logger.info("🔄 Testing task service import...")
            from services import task_service
            self.initialization_status['task_service'] = True
            self.logger.info("✅ Task service imported successfully")
            
            # Test if functions exist
            required_functions = ['create_task', 'get_all_tasks', 'get_task_by_id', 'update_task', 'delete_task']
            for func in required_functions:
                if hasattr(task_service, func):
                    self.logger.info(f"✅ task_service.{func}() function exists")
                else:
                    self.logger.warning(f"⚠️ task_service.{func}() function missing")
                    
        except ImportError as e:
            self.logger.error(f"❌ Task service import failed: {e}")
        except Exception as e:
            self.logger.error(f"❌ Task service import error: {e}")
            
    def register_blueprints(self):
        """Register all Flask blueprints"""
        # Personality routes
        try:
            self.logger.info("🔄 Attempting to import personality_routes...")
            from routes.personality_routes import personality_bp
            self.app.register_blueprint(personality_bp, url_prefix="/api/personality")
            self.initialization_status['personality_routes'] = True
            self.logger.info("✅ Personality routes registered successfully")
        except Exception as e:
            self.logger.error(f"❌ Personality routes registration failed: {e}")
            self.setup_personality_fallback_routes()
            
        # Task routes
        try:
            self.logger.info("🔄 Attempting to import task_routes...")
            from routes.task_routes import task_bp
            self.app.register_blueprint(task_bp, url_prefix="/api")
            self.initialization_status['task_routes'] = True
            self.logger.info("✅ Task routes registered successfully")
        except Exception as e:
            self.logger.error(f"❌ Task routes registration failed: {e}")
            
    def setup_personality_fallback_routes(self):
        """Setup fallback routes for personality functionality"""
        @self.app.route("/api/personality/questions", methods=["GET"])
        def direct_questions():
            """Direct route for personality questions"""
            try:
                questions_file = os.path.join(os.path.dirname(__file__), "questions", "personality_questions.json")
                with open(questions_file, "r", encoding="utf-8") as f:
                    questions = json.load(f)
                return jsonify({"success": True, "questions": questions, "source": "direct_route"})
            except FileNotFoundError:
                return jsonify({"success": False, "error": "Questions file not found"}), 404
            except Exception as e:
                return jsonify({"success": False, "error": str(e)}), 500

        @self.app.route("/api/personality/submit", methods=["POST"])
        def direct_submit():
            """Direct route for personality submission"""
            try:
                from services.personality_service import save_or_update_personality
                data = request.get_json()
                user_id = data.get("user_id")
                scores = data.get("scores")

                if not user_id or not scores:
                    return jsonify({"error": "Missing user_id or scores"}), 400

                personality = save_or_update_personality(user_id, scores)
                return jsonify({
                    "success": True,
                    "message": "Personality saved successfully",
                    "personality": personality,
                    "source": "direct_route"
                })
            except ImportError:
                return jsonify({"success": False, "error": "Personality service not available"}), 500
            except Exception as e:
                return jsonify({"success": False, "error": str(e)}), 500
                
    def setup_task_routes(self):
        """Setup task-related routes"""
        @self.app.route("/api/tasks", methods=["GET", "POST"])
        def handle_tasks():
            """Handle tasks operations"""
            try:
                if request.method == "GET":
                    return self.get_all_tasks()
                else:  # POST
                    return self.create_task()
            except Exception as e:
                self.logger.error(f"Tasks route error: {e}")
                return jsonify({"error": str(e)}), 500

        @self.app.route("/api/tasks/<task_id>", methods=["GET"])
        def get_task(task_id):
            """Get a specific task"""
            try:
                from services import task_service
                task = task_service.get_task_by_id(task_id)
                if not task:
                    return jsonify({"error": "Task not found"}), 404
                return jsonify(task.to_dict() if hasattr(task, 'to_dict') else task)
            except Exception as e:
                return jsonify({"error": str(e)}), 500
                
    def get_all_tasks(self):
        """Get all tasks"""
        try:
            from services import task_service
            tasks = task_service.get_all_tasks()
            task_dicts = [task.to_dict() if hasattr(task, 'to_dict') else task for task in tasks]
            
            suggestion = "Great job staying on track! Stay hydrated."
            if len(task_dicts) > 5:
                suggestion = "You've got a heavy workload. Take a 5-minute stretch break!"
            elif not task_dicts:
                suggestion = "No tasks today? Maybe do a quick mindfulness exercise."
                
            return jsonify({
                "tasks": task_dicts, 
                "suggestion": suggestion, 
                "count": len(task_dicts)
            })
        except Exception as e:
            self.logger.error(f"Task service error: {e}")
            return jsonify({
                "tasks": [],
                "suggestion": "Service temporarily unavailable",
                "error": str(e)
            })
            
    def create_task(self):
        """Create a new task"""
        try:
            from services import task_service
            data = request.get_json()
            
            if not data or "title" not in data:
                return jsonify({"error": "Title is required"}), 400
            
            task = task_service.create_task(data)
            return jsonify({
                "message": "Task created successfully",
                "task": task.to_dict() if hasattr(task, 'to_dict') else task
            }), 201
        except Exception as e:
            self.logger.error(f"Task creation error: {e}")
            return jsonify({
                "error": "Failed to create task",
                "details": str(e)
            }), 500
            
    def setup_health_routes(self):
        """Setup health check and info routes"""
        @self.app.route("/")
        def home():
            return jsonify({
                "message": "Mental Wellness Backend is running 🚀",
                "status": "healthy",
                "initialization": self.initialization_status
            })

        @self.app.route("/health")
        def health_check():
            return jsonify({
                "status": "healthy", 
                "service": "mental-wellness-backend",
                "initialization": self.initialization_status
            })

        @self.app.route("/api/info")
        def api_info():
            endpoints = {
                "personality_questions": "/api/personality/questions",
                "personality_submit": "/api/personality/submit",
                "tasks": "/api/tasks",
                "health": "/health"
            }
            
            return jsonify({
                "message": "Mental Wellness API",
                "version": "1.0.0",
                "endpoints": endpoints,
                "initialization": self.initialization_status
            })

        @self.app.route("/debug/routes")
        def debug_routes():
            routes = []
            for rule in self.app.url_map.iter_rules():
                routes.append({
                    "endpoint": rule.endpoint,
                    "methods": list(rule.methods),
                    "rule": rule.rule
                })
            return jsonify(routes)
            
    def setup_error_handlers(self):
        """Setup error handlers"""
        @self.app.errorhandler(404)
        def not_found(error):
            return jsonify({
                "success": False,
                "error": "Endpoint not found"
            }), 404

        @self.app.errorhandler(500)
        def internal_error(error):
            return jsonify({
                "success": False,
                "error": "Internal server error"
            }), 500
            
    def debug_directory_structure(self):
        """Debug directory structure for troubleshooting"""
        self.logger.info("📁 Directory structure:")
        for directory in ['utils', 'routes', 'services', 'models']:
            if os.path.exists(directory):
                files = [f for f in os.listdir(directory) if f.endswith('.py')]
                self.logger.info(f"📂 {directory}/: {files}")
            else:
                self.logger.warning(f"⚠️ Directory '{directory}' does not exist")
                
    def test_mongodb_connection(self):
        """Test MongoDB connection"""
        try:
            from utils.db import get_db
            db = get_db()
            collections = db.list_collection_names()
            self.logger.info(f"📊 MongoDB collections: {collections}")
        except Exception as e:
            self.logger.error(f"❌ MongoDB connection test failed: {e}")
            
    def run(self):
        """Run the Flask application"""
        self.logger.info("🚀 Starting Mental Wellness Backend...")
        
        self.check_required_files()
        self.setup_database()
        self.check_task_service()
        self.register_blueprints()
        self.setup_task_routes()
        self.setup_health_routes()
        self.setup_error_handlers()
        
        self.debug_directory_structure()
        self.test_mongodb_connection()
        
        self.logger.info("🌐 Server starting on http://0.0.0.0:5000")
        self.app.run(debug=True, host="0.0.0.0", port=5000, use_reloader=False)

# Create and run the application
if __name__ == "__main__":
    app = MentalWellnessApp()
    app.run()