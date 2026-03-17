SENSOR_LOGS_SCHEMA = """
CREATE TABLE IF NOT EXISTS sensor_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    container_id TEXT NOT NULL,
    temperature REAL,
    humidity REAL,
    vibration REAL,
    door_status INTEGER,
    gps_shift REAL,
    battery_voltage REAL,
    created_at TEXT NOT NULL
);
"""

ALERTS_SCHEMA = """
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_type TEXT NOT NULL,
    sensor TEXT NOT NULL,
    score REAL NOT NULL,
    created_at TEXT NOT NULL
);
"""
