from flask import Blueprint, request, jsonify
from datetime import datetime
from extensions import socketio

location_bp = Blueprint("location", __name__)


@location_bp.route("/api/container-location", methods=["POST"])
def container_location():
    payload = request.get_json(silent=True) or {}
    required = ["container_id", "gps_lat", "gps_lon"]
    missing = [key for key in required if key not in payload]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    update = {
        "container_id": payload["container_id"],
        "gps_lat": float(payload["gps_lat"]),
        "gps_lon": float(payload["gps_lon"]),
        "timestamp": payload.get("timestamp") or datetime.utcnow().isoformat(),
    }

    socketio.emit("gps_update", update)
    return jsonify({"status": "ok", "data": update}), 200
