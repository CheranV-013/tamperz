import eventlet
eventlet.monkey_patch()

from flask import Flask, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS

from config.settings import PORT, SECRET_KEY, CORS_ORIGINS
from database.db import init_db
from services.anomaly_service import AnomalyService
from services.sensor_simulator import SensorSimulator
from routes.sensor_routes import register_sensor_routes
from routes.alert_routes import alert_bp


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = SECRET_KEY
    CORS(app, resources={r"/api/*": {"origins": CORS_ORIGINS}})

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    return app


app = create_app()
socketio = SocketIO(app, cors_allowed_origins=CORS_ORIGINS, async_mode="eventlet")

init_db()

anomaly_service = AnomalyService(socketio=socketio)
app.register_blueprint(register_sensor_routes(anomaly_service))
app.register_blueprint(alert_bp)

simulator = SensorSimulator(anomaly_service, socketio, interval=3)
socketio.start_background_task(simulator.run)


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=PORT)
