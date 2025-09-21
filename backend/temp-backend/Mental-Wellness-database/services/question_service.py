import json
import os

# Path to your JSON file
QUESTIONS_FILE = os.path.join(os.path.dirname(__file__), "..", "questions", "personality_questions.json")

def get_all_questions():
    """
    Loads and returns the personality test questions from the JSON file.
    """
    try:
        with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
            questions = json.load(f)
        return questions
    except FileNotFoundError:
        print(f"Error: The questions file was not found at {QUESTIONS_FILE}")
        return []
    except json.JSONDecodeError:
        print(f"Error: The questions file at {QUESTIONS_FILE} is not valid JSON.")
        return []