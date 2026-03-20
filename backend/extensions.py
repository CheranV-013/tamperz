from flask_socketio import SocketIO

# central shared socket instance
socketio = SocketIO(cors_allowed_origins="*")