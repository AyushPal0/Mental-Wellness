import os
import sys
import logging
import uuid
import time
import math
import random
from flask import Flask, jsonify, request
from flask_cors import CORS

# Add current directory to Python path to fix import issues
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log', mode='a')
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask
app = Flask(__name__)

# Enable CORS
CORS(app)

# Configure app
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-2023')

# Store initialization status
initialization_status = {
    'mongodb': False,
    'personality_routes': False,
    'game_routes': False,
    'chat_routes': False,
    'task_routes': False,
    'community_routes': False,
    'safety_routes': False
}

# Debug: Check if files exist before importing
logger.info("Checking if required files exist...")
required_directories = ['utils', 'routes', 'services', 'models', 'questions']
required_files = [
    'utils/db.py',
    'routes/personality_routes.py',
    'routes/game_routes.py',
    'routes/chat_routes.py',
    'routes/task_routes.py',
    'routes/community_routes.py',
    'routes/safety_routes.py',
    'services/personality_service.py',
    'services/game_service.py',
    'services/chat_service.py',
    'services/task_service.py',
    'services/community_service.py',
    'services/safety_service.py',
    'questions/personality_questions.json'
]

# Check directories
for directory in required_directories:
    if os.path.exists(directory):
        logger.info(f"Found directory: {directory}/")
    else:
        logger.warning(f"Missing directory: {directory}/")

# Check files
for file_path in required_files:
    if os.path.exists(file_path):
        logger.info(f"Found: {file_path}")
    else:
        logger.warning(f"Missing: {file_path}")

# Import and initialize MongoDB
try:
    logger.info("Attempting to import utils.db...")
    from utils.db import init_db
    init_db(app)
    initialization_status['mongodb'] = True
    logger.info("MongoDB initialized successfully")
except ImportError as e:
    logger.error(f"MongoDB utils not found: {e}")
    logger.error("Please ensure utils/db.py exists and is properly configured.")
except Exception as e:
    logger.error(f"MongoDB initialization failed: {e}")

# Function to safely register blueprints
def register_blueprint(module_name, blueprint_name, status_key, url_prefix):
    try:
        module = __import__(f'routes.{module_name}', fromlist=[blueprint_name])
        blueprint = getattr(module, blueprint_name)
        app.register_blueprint(blueprint, url_prefix=url_prefix)
        initialization_status[status_key] = True
        logger.info(f"{module_name} routes registered successfully")
        return True
    except ImportError as e:
        logger.error(f"Failed to import {module_name}: {e}")
        return False
    except AttributeError as e:
        logger.error(f"Blueprint {blueprint_name} not found in {module_name}: {e}")
        return False
    except Exception as e:
        logger.error(f"{module_name} routes registration failed: {e}")
        return False

# Register all available blueprints
blueprints_to_register = [
    ('personality_routes', 'personality_bp', 'personality_routes', '/api/personality'),
    ('game_routes', 'game_bp', 'game_routes', '/api/game'),
    ('chat_routes', 'chat_bp', 'chat_routes', '/api/chat'),
    ('task_routes', 'task_bp', 'task_routes', '/api/task'),
    ('community_routes', 'community_bp', 'community_routes', '/api/community'),
    ('safety_routes', 'safety_bp', 'safety_routes', '/api/safety')
]

for module_name, blueprint_name, status_key, url_prefix in blueprints_to_register:
    register_blueprint(module_name, blueprint_name, status_key, url_prefix)

# Game levels configuration
LEVELS = [
    {  # Level 1: Simple alignment
        "items": [
            {"id": "book1", "type": "book", "width": 80, "height": 120, "correct_x": 100, "correct_y": 100, "correct_rotation": 0},
            {"id": "cup1", "type": "cup", "width": 60, "height": 80, "correct_x": 250, "correct_y": 100, "correct_rotation": 0},
            {"id": "plate1", "type": "plate", "width": 70, "height": 70, "correct_x": 400, "correct_y": 100, "correct_rotation": 0}
        ],
        "precision_threshold": 5,  # pixels
        "rotation_threshold": 5,   # degrees
        "time_limit": 120          # seconds
    },
    {  # Level 2: Sorting by attributes
        "items": [
            {"id": "book_small", "type": "book", "width": 60, "height": 100, "correct_x": 100, "correct_y": 100, "correct_rotation": 0, "color": "red"},
            {"id": "book_medium", "type": "book", "width": 70, "height": 110, "correct_x": 180, "correct_y": 100, "correct_rotation": 0, "color": "blue"},
            {"id": "book_large", "type": "book", "width": 80, "height": 120, "correct_x": 260, "correct_y": 100, "correct_rotation": 0, "color": "green"},
            {"id": "cup_red", "type": "cup", "width": 50, "height": 70, "correct_x": 100, "correct_y": 250, "correct_rotation": 0, "color": "red"},
            {"id": "cup_blue", "type": "cup", "width": 50, "height": 70, "correct_x": 180, "correct_y": 250, "correct_rotation": 0, "color": "blue"},
            {"id": "cup_green", "type": "cup", "width": 50, "height": 70, "correct_x": 260, "correct_y": 250, "correct_rotation": 0, "color": "green"}
        ],
        "precision_threshold": 4,
        "rotation_threshold": 4,
        "time_limit": 180
    },
    {  # Level 3: Complex symmetry
        "items": [
            {"id": "book_left", "type": "book", "width": 80, "height": 120, "correct_x": 150, "correct_y": 100, "correct_rotation": 0},
            {"id": "book_right", "type": "book", "width": 80, "height": 120, "correct_x": 450, "correct_y": 100, "correct_rotation": 0},
            {"id": "cup_left", "type": "cup", "width": 60, "height": 80, "correct_x": 150, "correct_y": 250, "correct_rotation": 0},
            {"id": "cup_right", "type": "cup", "width": 60, "height": 80, "correct_x": 450, "correct_y": 250, "correct_rotation": 0},
            {"id": "plate_center", "type": "plate", "width": 80, "height": 80, "correct_x": 300, "correct_y": 175, "correct_rotation": 0},
            {"id": "pen_tl", "type": "pen", "width": 40, "height": 120, "correct_x": 100, "correct_y": 50, "correct_rotation": 0},
            {"id": "pen_tr", "type": "pen", "width": 40, "height": 120, "correct_x": 500, "correct_y": 50, "correct_rotation": 0},
            {"id": "pen_bl", "type": "pen", "width": 40, "height": 120, "correct_x": 100, "correct_y": 300, "correct_rotation": 0},
            {"id": "pen_br", "type": "pen", "width": 40, "height": 120, "correct_x": 500, "correct_y": 300, "correct_rotation": 0}
        ],
        "precision_threshold": 3,
        "rotation_threshold": 3,
        "time_limit": 240
    }
]

# In-memory storage for game sessions and results
game_sessions = {}
game_results = {}

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

# Game routes - direct implementation since services might not exist
@app.route("/api/game/start", methods=["POST"])
def game_start():
    """Direct route for starting a game"""
    try:
        data = request.get_json()
        game_type = data.get("game_type", "ocd_table")
        level = data.get("level", 0)
        
        if level >= len(LEVELS):
            return jsonify({"error": "Invalid level"}), 400
        
        session_id = str(uuid.uuid4())
        
        # Get level configuration with slightly randomized starting positions
        level_config = LEVELS[level].copy()
        items_with_positions = []
        
        for item in level_config["items"]:
            # Randomize starting position (slightly off from correct position)
            offset_x = (random.random() * 40) - 20  # -20 to +20 pixels
            offset_y = (random.random() * 40) - 20
            offset_rotation = (random.random() * 10) - 5  # -5 to +5 degrees
            
            items_with_positions.append({
                **item,
                "start_x": item["correct_x"] + offset_x,
                "start_y": item["correct_y"] + offset_y,
                "start_rotation": item["correct_rotation"] + offset_rotation
            })
        
        # Store session
        game_sessions[session_id] = {
            "session_id": session_id,
            "level": level,
            "start_time": time.time(),
            "actions": []
        }
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "level": level,
            "items": items_with_positions,
            "precision_threshold": level_config["precision_threshold"],
            "rotation_threshold": level_config["rotation_threshold"],
            "time_limit": level_config["time_limit"]
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/game/action", methods=["POST"])
def game_action():
    """Record a game action"""
    try:
        data = request.get_json()
        session_id = data.get("session_id")
        
        if session_id not in game_sessions:
            return jsonify({"error": "Session not found"}), 404
        
        # Store the action
        action = {
            "item_id": data.get("item_id"),
            "action_type": data.get("action_type"),
            "timestamp": data.get("timestamp", time.time()),
            "time_taken": data.get("time_taken", 0)
        }
        
        game_sessions[session_id]["actions"].append(action)
        
        return jsonify({"success": True, "status": "recorded"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/game/check-placement", methods=["POST"])
def check_placement():
    """Check if an item is correctly placed"""
    try:
        data = request.get_json()
        item_id = data.get("id")
        x = data.get("x")
        y = data.get("y")
        rotation = data.get("rotation")
        
        # Find the correct position for this item
        correct_pos = None
        for level in LEVELS:
            for item in level["items"]:
                if item["id"] == item_id:
                    correct_pos = item
                    break
            if correct_pos:
                break
        
        if not correct_pos:
            return jsonify({"error": "Item configuration not found"}), 404
        
        # Calculate distance from correct position
        distance = math.sqrt(
            (x - correct_pos["correct_x"]) ** 2 + 
            (y - correct_pos["correct_y"]) ** 2
        )
        
        # Calculate rotation difference
        rotation_diff = abs(rotation - correct_pos["correct_rotation"])
        if rotation_diff > 180:  # Handle wrap-around (e.g., 359° vs 1°)
            rotation_diff = 360 - rotation_diff
        
        # Check if item is correctly positioned
        correctly_positioned = (
            distance <= LEVELS[0]["precision_threshold"] and  # Using level 0 threshold for simplicity
            rotation_diff <= LEVELS[0]["rotation_threshold"]
        )
        
        return jsonify({
            "correctly_positioned": correctly_positioned,
            "distance": distance,
            "rotation_diff": rotation_diff,
            "precision": max(0, 100 - (distance / 20 * 100)),  # Precision percentage
            "correct_position": {
                "x": correct_pos["correct_x"],
                "y": correct_pos["correct_y"],
                "rotation": correct_pos["correct_rotation"]
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/game/complete", methods=["POST"])
def game_complete():
    """Complete a game and calculate results"""
    try:
        data = request.get_json()
        session_id = data.get("session_id")
        level = data.get("level", 0)
        items_data = data.get("items", [])
        completion_time = data.get("completion_time", 0)
        corrections = data.get("corrections", 0)
        
        if session_id not in game_sessions:
            return jsonify({"error": "Session not found"}), 404
        
        session = game_sessions[session_id]
        
        # Calculate metrics
        total_time = completion_time if completion_time > 0 else (time.time() - session["start_time"])
        
        # Calculate average precision
        precision_sum = 0
        correctly_positioned = 0
        
        for item_data in items_data:
            # Create a mock check for each item
            item_id = item_data.get("id")
            x = item_data.get("x")
            y = item_data.get("y")
            rotation = item_data.get("rotation")
            
            # Find correct position
            correct_pos = None
            for lvl in LEVELS:
                for item in lvl["items"]:
                    if item["id"] == item_id:
                        correct_pos = item
                        break
                if correct_pos:
                    break
            
            if correct_pos:
                distance = math.sqrt(
                    (x - correct_pos["correct_x"]) ** 2 + 
                    (y - correct_pos["correct_y"]) ** 2
                )
                precision = max(0, 100 - (distance / 20 * 100))
                precision_sum += precision
                
                rotation_diff = abs(rotation - correct_pos["correct_rotation"])
                if rotation_diff > 180:
                    rotation_diff = 360 - rotation_diff
                
                if (distance <= LEVELS[0]["precision_threshold"] and 
                    rotation_diff <= LEVELS[0]["rotation_threshold"]):
                    correctly_positioned += 1
        
        avg_precision = precision_sum / len(items_data) if items_data else 0
        
        # Calculate severity score
        time_factor = min(1.0, total_time / (LEVELS[level]["time_limit"] * 0.5)) if level < len(LEVELS) else 0.5
        correction_factor = min(2.0, corrections / (len(items_data) * 2)) if items_data else 1.0
        precision_factor = avg_precision / 100
        
        severity_score = (time_factor * 0.3 + correction_factor * 0.4 + precision_factor * 0.3) * 100
        
        # Determine interpretation
        if severity_score < 40:
            interpretation = "Mild"
        elif severity_score < 70:
            interpretation = "Moderate"
        else:
            interpretation = "Severe"
        
        # Store result
        result = {
            "session_id": session_id,
            "total_time": total_time,
            "corrections": corrections,
            "precision": avg_precision,
            "severity_score": severity_score,
            "interpretation": interpretation
        }
        
        game_results[session_id] = result
        game_sessions[session_id]["completed"] = True
        game_sessions[session_id]["end_time"] = time.time()
        
        return jsonify({
            "success": True,
            "result": result
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/game/leaderboard", methods=["GET"])
def game_leaderboard():
    """Get game leaderboard"""
    try:
        limit = request.args.get('limit', 10, type=int)
        sorted_results = sorted(
            list(game_results.values()), 
            key=lambda x: x["severity_score"], 
            reverse=True
        )[:limit]
        
        return jsonify({
            "success": True,
            "leaderboard": sorted_results
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Root health check
@app.route("/")
def home():
    list_routes()  # List routes for debugging
    return jsonify({
        "message": "EUNOIA Mental Wellness Backend is running",
        "status": "healthy",
        "initialization": initialization_status,
        "direct_routes_active": True,
        "version": "1.0.0"
    })

# Health check endpoint
@app.route("/health")
def health_check():
    return jsonify({
        "status": "healthy", 
        "service": "eunoia-backend",
        "initialization": initialization_status,
        "timestamp": "2023-10-01T12:00:00Z"
    })

# API info endpoint
@app.route("/api")
def api_info():
    return jsonify({
        "message": "EUNOIA Mental Wellness API",
        "version": "1.0.0",
        "endpoints": {
            "personality_questions": "/api/personality/questions",
            "personality_submit": "/api/personality/submit",
            "game_start": "/api/game/start",
            "game_action": "/api/game/action",
            "game_check_placement": "/api/game/check-placement",
            "game_complete": "/api/game/complete",
            "game_leaderboard": "/api/game/leaderboard",
            "health": "/health",
            "root": "/",
            "debug_routes": "/debug/routes"
        },
        "initialization": initialization_status
    })

# Debug endpoint to see all routes
@app.route("/debug/routes")
def debug_routes():
    routes_list = []
    for rule in app.url_map.iter_rules():
        if not rule.rule.startswith('/debug/'):  # Skip debug routes themselves
            routes_list.append({
                "endpoint": rule.endpoint,
                "methods": list(rule.methods),
                "path": str(rule)
            })
    return jsonify({"routes": routes_list})

# Function to list all registered routes for debugging
def list_routes():
    logger.info("\n=== Registered Routes ===")
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

# Basic test route
@app.route("/api/test")
def test_route():
    return jsonify({
        "success": True,
        "message": "Backend is working!",
        "timestamp": "2023-10-01T12:00:00Z"
    })

if __name__ == "__main__":
    logger.info("=== STARTING EUNOIA MENTAL WELLNESS BACKEND ===")
    logger.info(f"Current working directory: {os.getcwd()}")
    logger.info(f"App directory: {os.path.dirname(os.path.abspath(__file__))}")
    
    # List all Python files in important directories
    for directory in ['utils', 'routes', 'services', 'models']:
        if os.path.exists(directory):
            files = [f for f in os.listdir(directory) if f.endswith('.py')]
            logger.info(f"{directory}/: {files}")
        else:
            logger.warning(f"Directory '{directory}' does not exist")
    
    list_routes()  # Show routes at startup
    
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    logger.info(f"Starting server on port {port}...")
    app.run(debug=True, host="0.0.0.0", port=port)