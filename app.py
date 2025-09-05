from flask import Flask
from backend.routes.personality_routes import personality_bp
from backend.utils.db import init_db  # Assuming you have DB setup here

# Initialize Flask
app = Flask(__name__)

# Initialize MongoDB
init_db(app)

# Register blueprints
app.register_blueprint(personality_bp, url_prefix="/api/personality")

# Root health check
@app.route("/")
def home():
    return {"message": "Mental Wellness Backend is running 🚀"}

if __name__ == "__main__":
    app.run(debug=True)
