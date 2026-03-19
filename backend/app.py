import eventlet
eventlet.monkey_patch()

import os
from datetime import datetime

from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS

from config.settings import SECRET_KEY
from database.db import init_db
from services.anomaly_service import AnomalyService
from services.sensor_simulator import SensorSimulator
from routes.sensor_routes import register_sensor_routes
from routes.alert_routes import alert_bp

import requests
from user_agents import parse


# =========================
# 🔥 ACCESS TRACKING HELPERS
# =========================

def get_client_ip():
    if request.headers.get("X-Forwarded-For"):
        return request.headers.get("X-Forwarded-For").split(",")[0]
    return request.remote_addr


def get_location(ip):
    try:
        res = requests.get(f"http://ip-api.com/json/{ip}").json()
        return {
            "country": res.get("country"),
            "region": res.get("regionName"),
            "city": res.get("city"),
            "lat": res.get("lat"),
            "lon": res.get("lon"),
            "isp": res.get("isp"),
        }
    except:
        return {}


# =========================
# 🚀 CREATE APP
# =========================

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = SECRET_KEY

    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    @app.route("/", methods=["GET"])
    def home():
        return jsonify({
            "service": "AI IoT Tamper Detection API",
            "status": "running"
        })

    @app.route("/api/access-log", methods=["GET"])
    def access_log():
        ip = get_client_ip()
        ua_string = request.headers.get("User-Agent")

        ua = parse(ua_string)

        device_info = {
            "browser": ua.browser.family,
            "os": ua.os.family,
            "device": "Mobile" if ua.is_mobile else "Desktop"
        }

        location = get_location(ip)

        log = {
            "ip": ip,
            "location": location,
            "device_info": device_info,
            "timestamp": datetime.utcnow().isoformat()
        }

        print("🚨 ACCESS LOG:", log)

        return jsonify(log)

    return app


# =========================
# ⚙️ INITIALIZE APP
# =========================

app = create_app()

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="eventlet",
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25,
    cors_credentials=True
)

# ✅ CORRECT PLACE FOR SOCKET HANDLER
@socketio.on("connect")
def handle_connect():
    print("✅ CLIENT CONNECTED TO BACKEND", flush=True)


# =========================
# 🗄 INIT SERVICES
# =========================

init_db()

anomaly_service = AnomalyService(socketio=socketio)

app.register_blueprint(register_sensor_routes(anomaly_service))
app.register_blueprint(alert_bp)


# =========================
# 🤖 SENSOR SIMULATOR
# =========================

simulator = SensorSimulator(anomaly_service, socketio, interval=3)


# =========================
# 🤖 START SIMULATOR
# =========================

def start_background():
    print("🔥 Starting simulator thread...", flush=True)
    socketio.start_background_task(simulator.run)

# ✅ USE EVENTLET (NOT threading)
eventlet.spawn(start_background)


# =========================
# 🚀 RUN SERVER
# =========================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port)