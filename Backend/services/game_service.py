import random
import string
from typing import Dict, Any

def start_game(game_type: str) -> Dict[str, Any]:
    """Start a new game session"""
    session_id = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
    
    if game_type == 'ocd_pattern':
        return {
            'session_id': session_id,
            'game_type': game_type,
            'patterns': generate_patterns()
        }
    else:
        return {
            'session_id': session_id,
            'game_type': game_type,
            'message': 'Game started'
        }

def complete_game(results: Dict[str, Any]) -> Dict[str, Any]:
    """Complete a game and calculate results"""
    return {
        'score': random.randint(50, 100),
        'completion_time': results.get('completion_time', 0),
        'corrections': results.get('corrections', 0),
        'precision': random.uniform(70, 100)
    }

def generate_patterns():
    """Generate game patterns (simplified)"""
    return [
        {
            'level': 1,
            'sequence': ['circle', 'square', 'circle', 'square', '?'],
            'correct_option': 0
        }
    ]