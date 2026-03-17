import eventlet
eventlet.monkey_patch()

import os
from flask import Flask, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS

from config.settings import SECRET_KEY
from database.db import init_db
from services.anomaly_service import AnomalyService
from services.sensor_simulator import SensorSimulator
from routes.sensor_routes import register_sensor_routes
from routes.alert_routes import alert_bp


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = SECRET_KEY

    # Allow frontend requests (Vercel)
    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=True
    )

    # Health check endpoint
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    # Root endpoint (optional but useful)
    @app.route("/", methods=["GET"])
    def home():
        return jsonify({
            "service": "AI IoT Tamper Detection API",
            "status": "running"
        })

    return app


# Create Flask app
app = create_app()

# Configure SocketIO
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="eventlet"
)

# Initialize database
init_db()

# Initialize AI anomaly service
anomaly_service = AnomalyService(socketio=socketio)

# Register API routes
app.register_blueprint(register_sensor_routes(anomaly_service))
app.register_blueprint(alert_bp)

# Start IoT sensor simulator
simulator = SensorSimulator(anomaly_service, socketio, interval=3)
socketio.start_background_task(simulator.run)


# Run server (local + Render compatibility)
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    socketio.run(
        app,
        host="0.0.0.0",
        port=port
    )