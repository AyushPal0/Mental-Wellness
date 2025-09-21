from flask import Blueprint, request, jsonify
import uuid
import time
import math
import random
from typing import Dict, List, Optional

game_bp = Blueprint('game', __name__)

# Data models (as Python classes)
class ItemPosition:
    def __init__(self, id: str, x: float, y: float, rotation: float, correctly_positioned: bool):
        self.id = id
        self.x = x
        self.y = y
        self.rotation = rotation
        self.correctly_positioned = correctly_positioned

class UserAction:
    def __init__(self, session_id: str, item_id: str, action_type: str, 
                 start_position: Dict[str, float], end_position: Dict[str, float], 
                 time_taken: float, timestamp: float):
        self.session_id = session_id
        self.item_id = item_id
        self.action_type = action_type
        self.start_position = start_position
        self.end_position = end_position
        self.time_taken = time_taken
        self.timestamp = timestamp

class GameSession:
    def __init__(self, session_id: str, level: int, start_time: float, 
                 end_time: Optional[float] = None, actions: List[UserAction] = None, 
                 completed: bool = False):
        self.session_id = session_id
        self.level = level
        self.start_time = start_time
        self.end_time = end_time
        self.actions = actions or []
        self.completed = completed

class SeverityScore:
    def __init__(self, session_id: str, total_time: float, corrections: int, 
                 precision: float, severity_score: float, interpretation: str):
        self.session_id = session_id
        self.total_time = total_time
        self.corrections = corrections
        self.precision = precision
        self.severity_score = severity_score
        self.interpretation = interpretation

    def to_dict(self):
        return {
            "session_id": self.session_id,
            "total_time": self.total_time,
            "corrections": self.corrections,
            "precision": self.precision,
            "severity_score": self.severity_score,
            "interpretation": self.interpretation
        }

# In-memory storage (use database in production)
sessions: Dict[str, GameSession] = {}
results: Dict[str, SeverityScore] = {}

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

@game_bp.route('/start', methods=['POST'])
def start_session():
    try:
        data = request.get_json()
        level = data.get('level', 0)
        
        if level >= len(LEVELS):
            return jsonify({"error": "Invalid level"}), 400
        
        session_id = str(uuid.uuid4())
        session = GameSession(
            session_id=session_id,
            level=level,
            start_time=time.time()
        )
        sessions[session_id] = session
        
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
        
        return jsonify({
            "session_id": session_id,
            "level": level,
            "items": items_with_positions,
            "precision_threshold": level_config["precision_threshold"],
            "rotation_threshold": level_config["rotation_threshold"],
            "time_limit": level_config["time_limit"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@game_bp.route('/action', methods=['POST'])
def record_action():
    try:
        data = request.get_json()
        session_id = data.get("session_id")
        item_id = data.get("item_id")
        action_type = data.get("action_type")
        
        if session_id not in sessions:
            return jsonify({"error": "Session not found"}), 404
        
        action = UserAction(
            session_id=session_id,
            item_id=item_id,
            action_type=action_type,
            start_position=data.get("start_position", {}),
            end_position=data.get("end_position", {}),
            time_taken=data.get("time_taken", 0),
            timestamp=data.get("timestamp", time.time())
        )
        
        sessions[session_id].actions.append(action)
        return jsonify({"status": "recorded"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@game_bp.route('/check-placement', methods=['POST'])
def check_placement():
    try:
        data = request.get_json()
        item_id = data.get("id")
        x = data.get("x")
        y = data.get("y")
        rotation = data.get("rotation")
        
        if item_id not in [item["id"] for level in LEVELS for item in level["items"]]:
            return jsonify({"error": "Item not found"}), 404
        
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
        return jsonify({"error": str(e)}), 500

@game_bp.route('/complete', methods=['POST'])
def complete_level():
    try:
        data = request.get_json()
        session_id = data.get("session_id")
        level = data.get("level")
        items_data = data.get("items", [])
        completion_time = data.get("completion_time", 0)
        corrections = data.get("corrections", 0)
        
        if session_id not in sessions:
            return jsonify({"error": "Session not found"}), 404
        
        session = sessions[session_id]
        
        # Calculate metrics
        total_time = completion_time if completion_time > 0 else (time.time() - session.start_time)
        
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
        result = SeverityScore(
            session_id=session_id,
            total_time=total_time,
            corrections=corrections,
            precision=avg_precision,
            severity_score=severity_score,
            interpretation=interpretation
        )
        
        results[session_id] = result
        sessions[session_id].completed = True
        sessions[session_id].end_time = time.time()
        
        return jsonify({
            "success": True,
            "result": result.to_dict()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@game_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        limit = request.args.get('limit', 10, type=int)
        sorted_results = sorted(
            list(results.values()), 
            key=lambda x: x.severity_score, 
            reverse=True
        )[:limit]
        
        return jsonify({
            "leaderboard": [result.to_dict() for result in sorted_results]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500