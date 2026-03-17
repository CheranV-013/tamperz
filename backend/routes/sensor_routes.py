from flask import Blueprint, request, jsonify

sensor_bp = Blueprint("sensor_bp", __name__)


def register_sensor_routes(anomaly_service):
    @sensor_bp.route("/api/sensor-data", methods=["POST"])
    def ingest_sensor_data():
        payload = request.get_json(silent=True) or {}
        required = [
            "container_id",
            "temperature",
            "humidity",
            "vibration",
            "door_status",
            "gps_shift",
            "battery_voltage",
        ]
        missing = [key for key in required if key not in payload]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        alert = anomaly_service.process_sensor_data(payload, source="api")
        return jsonify({"status": "ok", "alert": alert}), 200

    return sensor_bp
