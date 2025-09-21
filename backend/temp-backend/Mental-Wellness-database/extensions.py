from flask_socketio import SocketIO

# Initialize SocketIO without attaching it to a Flask app yet
socketio = SocketIO(cors_allowed_origins="*")