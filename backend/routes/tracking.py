from flask import Blueprint, request
import requests
from datetime import datetime
from app import socketio

tracking_bp = Blueprint("tracking", __name__)

def get_location(ip):
    try:
        res = requests.get(f"http://ip-api.com/json/{ip}")
        data = res.json()
        return {
            "city": data.get("city"),
            "country": data.get("country"),
            "lat": data.get("lat"),
            "lon": data.get("lon")
        }
    except:
        return {}

@tracking_bp.route("/track", methods=["GET"])
def track_user():
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    if forwarded_for:
        ip = forwarded_for.split(",")[0].strip()
    else:
        ip = request.remote_addr
    user_agent = request.headers.get("User-Agent")

    location = get_location(ip)

    log = {
        "ip": ip,
        "browser": user_agent,
        "location": location,
        "timestamp": datetime.utcnow().isoformat()
    }

    print("TRACK:", log)
    socketio.emit("visitor_update", log, broadcast=True)

    return {"status": "tracked", "data": log}
