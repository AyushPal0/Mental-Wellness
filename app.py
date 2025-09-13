import os
import sys
import logging
from flask import Flask, jsonify
from flask_cors import CORS

# Add current directory to Python path to fix import issues
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log', mode='w')
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask
app = Flask(__name__)

# Enable CORS
CORS(app)

# Configure app
app.config['DEBUG'] = True

# Store initialization status
initialization_status = {
    'mongodb': False,
    'personality_routes': False
}

# Debug: Check if files exist before importing
logger.info("🔍 Checking if required files exist...")
required_files = [
    'utils/db.py',
    'routes/personality_routes.py',
    'services/personality_service.py',
    'questions/personality_questions.json'
]

for file_path in required_files:
    if os.path.exists(file_path):
        logger.info(f"✅ Found: {file_path}")
    else:
        logger.warning(f"❌ Missing: {file_path}")

try:
    # Import and initialize MongoDB
    logger.info("🔄 Attempting to import utils.db...")
    from utils.db import init_db
    init_db(app)
    initialization_status['mongodb'] = True
    logger.info("✅ MongoDB initialized successfully")
except ImportError as e:
    logger.error(f"❌ MongoDB utils not found: {e}")
    logger.error("Please ensure utils/db.py exists and is properly configured.")
except Exception as e:
    logger.error(f"❌ MongoDB initialization failed: {e}")

try:
    # Import and register personality blueprint
    logger.info("🔄 Attempting to import routes.personality_routes...")
    from routes.personality_routes import personality_bp
    app.register_blueprint(personality_bp, url_prefix="/api/personality")
    initialization_status['personality_routes'] = True
    logger.info("✅ Personality routes registered successfully")
except ImportError as e:
    logger.error(f"❌ Personality routes import failed: {e}")
    logger.error("This usually means:")
    logger.error("1. routes/personality_routes.py doesn't exist")
    logger.error("2. There's a syntax error in the file")
    logger.error("3. Import paths are wrong")
    
    # Try to debug the import
    try:
        import routes
        logger.info(f"✅ routes package exists: {dir(routes)}")
    except ImportError as e:
        logger.error(f"❌ Cannot import routes package: {e}")
        
except Exception as e:
    logger.error(f"❌ Personality routes registration failed: {e}")

# TEMPORARY: Add direct routes for testing since blueprint might not work
@app.route("/api/personality/questions", methods=["GET"])
def direct_questions():
    """Direct route for personality questions"""
    try:
        import json
        questions_file = os.path.join(os.path.dirname(__file__), "questions", "personality_questions.json")
        with open(questions_file, "r", encoding="utf-8") as f:
            questions = json.load(f)
        return jsonify({"success": True, "questions": questions, "source": "direct_route"})
    except FileNotFoundError:
        return jsonify({"success": False, "error": "Questions file not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/personality/submit", methods=["POST"])
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
            "personality": personality.dict(by_alias=True),
            "source": "direct_route"
        })
    except ImportError:
        return jsonify({"success": False, "error": "Personality service not available"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Root health check
@app.route("/")
def home():
    list_routes()  # List routes for debugging
    return {
        "message": "Mental Wellness Backend is running 🚀",
        "status": "healthy",
        "initialization": initialization_status,
        "direct_routes_active": True
    }

# Health check endpoint
@app.route("/health")
def health_check():
    return {
        "status": "healthy", 
        "service": "mental-wellness-backend",
        "initialization": initialization_status,
        "timestamp": "2023-10-01T12:00:00Z"
    }

# API info endpoint
@app.route("/api")
def api_info():
    return {
        "message": "Mental Wellness API",
        "version": "1.0.0",
        "endpoints": {
            "personality_questions": "/api/personality/questions",
            "personality_submit": "/api/personality/submit",
            "health": "/health",
            "root": "/",
            "debug_routes": "/debug/routes"
        },
        "initialization": initialization_status
    }

# Debug endpoint to see all routes
@app.route("/debug/routes")
def debug_routes():
    routes_list = []
    for rule in app.url_map.iter_rules():
        routes_list.append({
            "endpoint": rule.endpoint,
            "methods": list(rule.methods),
            "path": str(rule)
        })
    return jsonify({"routes": routes_list})

# Function to list all registered routes for debugging
def list_routes():
    logger.info("\n🌐 Registered Routes:")
    for rule in app.url_map.iter_rules():
        methods = ', '.join(sorted(rule.methods - {'OPTIONS', 'HEAD'}))
        logger.info(f"  {methods:15} {rule.rule:40} -> {rule.endpoint}")

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found",
        "message": "The requested URL was not found on the server. Check /debug/routes for available endpoints."
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error",
        "message": "Something went wrong on the server side."
    }), 500

if __name__ == "__main__":
    logger.info("🚀 Starting Mental Wellness Backend...")
    logger.info(f"📁 Current working directory: {os.getcwd()}")
    logger.info(f"📁 App directory: {os.path.dirname(os.path.abspath(__file__))}")
    
    # List all Python files in important directories
    for directory in ['utils', 'routes', 'services']:
        if os.path.exists(directory):
            files = [f for f in os.listdir(directory) if f.endswith('.py')]
            logger.info(f"📂 {directory}/: {files}")
            
            # Check file contents
            for file in files:
                file_path = os.path.join(directory, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        first_line = f.readline().strip()
                    logger.info(f"   📄 {file}: {first_line}...")
                except:
                    logger.info(f"   📄 {file}: Could not read")
        else:
            logger.warning(f"⚠️  Directory '{directory}' does not exist")
    
    list_routes()  # Show routes at startup
    
    app.run(debug=True, host="0.0.0.0", port=5000)