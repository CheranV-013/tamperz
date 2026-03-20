import random
from datetime import datetime
import numpy as np
from models.isolation_forest import IsolationForestModel
from models.autoencoder import AutoencoderModel
from database.db import insert_alert, insert_sensor_log

FEATURES = [
    "temperature",
    "humidity",
    "vibration",
    "door_status",
    "gps_shift",
    "battery_voltage",
]

IFOREST_THRESHOLD = 0.7
AUTOENCODER_THRESHOLD = 0.6


class AnomalyService:
    def __init__(self, socketio=None):
        self.socketio = socketio
        self.iforest = IsolationForestModel()
        self.autoencoder = AutoencoderModel(input_dim=len(FEATURES))
        self._train_models()

    def _generate_normal_data(self, samples=500):
        data = []
        for _ in range(samples):
            data.append(
                [
                    random.uniform(18, 28),
                    random.uniform(40, 70),
                    random.uniform(0.05, 0.2),
                    0,
                    random.uniform(0.0, 0.05),
                    random.uniform(3.6, 4.1),
                ]
            )
        return np.array(data, dtype=np.float32)

    def _train_models(self):
        X_train = self._generate_normal_data()
        self.iforest.fit(X_train)
        self.autoencoder.fit(X_train)

    def _rule_based_check(self, payload):
        triggers = []

        if payload["door_status"] == 1:
            triggers.append("door_status")

        if payload["vibration"] > 0.6:
            triggers.append("vibration")

        if payload["gps_shift"] > 0.6:
            triggers.append("gps_shift")

        if payload["battery_voltage"] < 3.2:
            triggers.append("battery_voltage")

        if payload["temperature"] < 10 or payload["temperature"] > 40:
            triggers.append("temperature")

        if payload["humidity"] < 20 or payload["humidity"] > 85:
            triggers.append("humidity")

        return triggers

    def process_sensor_data(self, payload, source="api"):
        try:
            # ✅ Ensure timestamp exists
            if "timestamp" not in payload:
                payload["timestamp"] = datetime.utcnow().isoformat()

            # ✅ Convert to model vector
            vector = np.array([[payload[f] for f in FEATURES]], dtype=np.float32)

            # ✅ Model scores
            iforest_score = float(self.iforest.score(vector)[0])
            auto_score = float(self.autoencoder.score(vector)[0])
            rule_triggers = self._rule_based_check(payload)

            # ✅ Store sensor log
            insert_sensor_log(payload)

            # ✅ EMIT SENSOR DATA (FIXED)
            if self.socketio:
                print("📡 EMITTING SENSOR DATA:", payload, flush=True)
                self.socketio.emit(
                    "sensor_data",
                    payload,
                    namespace="/",
                    broadcast=True   # 🔥 ensures all clients receive
                )

            # ✅ Check anomaly
            anomaly_detected = (
                iforest_score >= IFOREST_THRESHOLD
                or auto_score >= AUTOENCODER_THRESHOLD
                or len(rule_triggers) > 0
            )

            if anomaly_detected:
                sensor = rule_triggers[0] if rule_triggers else "multi"
                score = max(
                    iforest_score,
                    auto_score,
                    0.9 if rule_triggers else 0.0
                )

                alert = {
                    "type": "Tamper",
                    "sensor": sensor,
                    "score": round(score, 2),
                    "time": datetime.utcnow().isoformat(),
                    "container_id": payload["container_id"],
                    "source": source,
                }

                # ✅ Store alert
                insert_alert(alert["type"], alert["sensor"], alert["score"])

                # ✅ EMIT ALERT (FIXED)
                if self.socketio:
                    print("🚨 EMITTING ALERT:", alert, flush=True)
                    self.socketio.emit(
                        "tamper_alert",
                        alert,
                        namespace="/",
                        broadcast=True
                    )

                return alert

            return None

        except Exception as e:
            print("❌ ERROR in process_sensor_data:", str(e), flush=True)
            return None