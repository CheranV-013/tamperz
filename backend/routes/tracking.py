from flask import Blueprint, request
import requests
from datetime import datetime
from extensions import socketio
from user_agents import parse

tracking_bp = Blueprint("tracking", __name__)

# ✅ GLOBAL STORAGE (VERY IMPORTANT)
visitor_logs = []

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

# ✅ TRACK ROUTE
@tracking_bp.route("/track", methods=["GET"])
def track_user():
    try:
        forwarded_for = request.headers.get("X-Forwarded-For", "")
        ip = forwarded_for.split(",")[0].strip() if forwarded_for else request.remote_addr

        user_agent = request.headers.get("User-Agent", "")

        location = get_location(ip)

        # Optional GPS override from browser (query params)
        lat = request.args.get("lat")
        lon = request.args.get("lon")
        accuracy = request.args.get("accuracy")
        if lat and lon:
            try:
                location = {
                    **location,
                    "lat": float(lat),
                    "lon": float(lon),
                    "accuracy": float(accuracy) if accuracy else None,
                    "source": "gps",
                }
            except ValueError:
                pass

        ua = parse(user_agent)
        browser_name = ua.browser.family or "Unknown"
        browser_version = ".".join([str(v) for v in ua.browser.version or []])
        browser_label = (
            f"{browser_name} {browser_version}".strip()
            if browser_version
            else browser_name
        )

        log = {
            "ip": ip,
            "browser": browser_label,
            "location": location,
            "timestamp": datetime.utcnow().isoformat(),
        }

        print("TRACK:", log, flush=True)

        # ✅ STORE VISITOR (IMPORTANT)
        visitor_logs.insert(0, log)
        visitor_logs[:] = visitor_logs[:50]  # keep last 50

        # ✅ SOCKET EMIT (REAL-TIME)
        try:
            socketio.emit("visitor_update", log)
        except Exception as e:
            print("❌ Socket emit error:", e)

        return {"status": "tracked", "data": log}

    except Exception as e:
        print("❌ TRACK ERROR:", e, flush=True)
        return {"error": str(e)}, 500


# ✅ VISITORS API (FOR FRONTEND FALLBACK)
@tracking_bp.route("/visitors", methods=["GET"])
def get_visitors():
    return {"visitors": visitor_logs}
