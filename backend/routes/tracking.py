from flask import Blueprint, request
import requests
from datetime import datetime
from extensions import socketio

tracking_bp = Blueprint("tracking", __name__)

def get_location(ip):
    try:
        res = requests.get(f"http://ip-api.com/json/{ip}", timeout=3)
        data = res.json()
        return {
            "city": data.get("city"),
            "country": data.get("country"),
            "lat": data.get("lat"),
            "lon": data.get("lon")
        }
    except Exception as e:
        print("❌ Location error:", e)
        return {}

@tracking_bp.route("/track", methods=["GET"])
def track_user():
    try:
        forwarded_for = request.headers.get("X-Forwarded-For", "")
        ip = forwarded_for.split(",")[0].strip() if forwarded_for else request.remote_addr

        user_agent = request.headers.get("User-Agent", "Unknown")

        location = get_location(ip)

        log = {
            "ip": ip,
            "browser": user_agent,
            "location": location,
            "timestamp": datetime.utcnow().isoformat()
        }

        print("TRACK:", log, flush=True)    

        # 🔥 SAFE EMIT
        try:
            socketio.emit("visitor_update", log)
        except Exception as e:
            print("❌ Socket emit error:", e)

        return {"status": "tracked", "data": log}

    except Exception as e:
        print("❌ TRACK ERROR:", e, flush=True)
        return {"error": str(e)}, 500