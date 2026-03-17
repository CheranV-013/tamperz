from flask import Blueprint, jsonify
from database.db import fetch_alerts

alert_bp = Blueprint("alert_bp", __name__)


@alert_bp.route("/api/alerts", methods=["GET"])
def get_alerts():
    alerts = fetch_alerts()
    return jsonify({"alerts": alerts}), 200
