import sys
import os

# Add the Backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("Testing Personality Blueprint Creation")
print("=" * 50)

try:
    print("1. Testing personality routes import...")
    from routes.personality_routes_fixed import personality_bp
    print("✅ Personality routes imported successfully")

    print("2. Testing personality service import...")
    from services.personality_service import save_or_update_personality
    print("✅ Personality service imported successfully")

    print("3. Testing personality model import...")
    from models.personality import Personality
    print("✅ Personality model imported successfully")

    print("4. Testing utils.db import...")
    from utils.db import get_db
    print("✅ Utils.db imported successfully")

    print("\n✅ All imports successful! The personality blueprint should work.")

except Exception as e:
    print(f"❌ Import error: {e}")
    import traceback
    traceback.print_exc()
