import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

PORT = int(os.getenv("PORT", "5000"))
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

DATABASE_PATH = os.path.join(BASE_DIR, "database", "sensor_data.sqlite3")

# Allow local dev and configurable origins for deployment
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
if CORS_ORIGINS != "*":
    CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS.split(",")]
