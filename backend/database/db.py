import sqlite3
from datetime import datetime
from .models import SENSOR_LOGS_SCHEMA, ALERTS_SCHEMA
from config.settings import DATABASE_PATH


def get_connection():
    conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(SENSOR_LOGS_SCHEMA)
    cur.execute(ALERTS_SCHEMA)
    conn.commit()
    conn.close()


def insert_sensor_log(payload):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO sensor_logs (
            container_id, temperature, humidity, vibration, door_status, gps_shift, battery_voltage, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload["container_id"],
            payload["temperature"],
            payload["humidity"],
            payload["vibration"],
            payload["door_status"],
            payload["gps_shift"],
            payload["battery_voltage"],
            datetime.utcnow().isoformat(),
        ),
    )
    conn.commit()
    conn.close()


def insert_alert(alert_type, sensor, score):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO alerts (alert_type, sensor, score, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (alert_type, sensor, score, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()


def fetch_alerts(limit=50):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT alert_type, sensor, score, created_at
        FROM alerts
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,),
    )
    rows = cur.fetchall()
    conn.close()
    return [dict(row) for row in rows]
