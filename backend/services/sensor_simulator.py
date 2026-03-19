import random
import eventlet
from datetime import datetime


class SensorSimulator:
    def __init__(self, anomaly_service, socketio, interval=3):
        self.anomaly_service = anomaly_service
        self.socketio = socketio
        self.interval = interval
        self.container_ids = ["C101", "C102", "C103"]

    def _generate_payload(self):
        tamper = random.random() < 0.08
        payload = {
            "container_id": random.choice(self.container_ids),
            "temperature": random.uniform(18, 28),
            "humidity": random.uniform(45, 70),
            "vibration": random.uniform(0.05, 0.18),
            "door_status": 0,
            "gps_shift": random.uniform(0.0, 0.05),
            "battery_voltage": random.uniform(3.6, 4.1),
        }

        if tamper:
            tamper_type = random.choice(["vibration", "door", "gps", "battery", "temp"])
            if tamper_type == "vibration":
                payload["vibration"] = random.uniform(0.7, 1.2)
            elif tamper_type == "door":
                payload["door_status"] = 1
            elif tamper_type == "gps":
                payload["gps_shift"] = random.uniform(0.8, 1.5)
            elif tamper_type == "battery":
                payload["battery_voltage"] = random.uniform(2.7, 3.1)
            elif tamper_type == "temp":
                payload["temperature"] = random.uniform(42, 55)

        return payload

    def run(self):
        print("🚀 Simulator loop started", flush=True)

        while True:
            payload = self._generate_payload()
            print("🔥 SENSOR EMIT:", payload, flush=True)
            self.socketio.emit("sensor_data", payload, namespace="/")
            
            eventlet.sleep(self.interval)