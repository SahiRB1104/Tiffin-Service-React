import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()


# =========================
# APP ENV
# =========================
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")


# =========================
# JWT CONFIG
# =========================
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_DAYS = int(os.getenv("ACCESS_TOKEN_EXPIRE_DAYS", 1))

if not SECRET_KEY:
    raise RuntimeError("❌ SECRET_KEY is missing in environment variables")


# =========================
# MONGODB CONFIG
# =========================
MONGO_URL = os.getenv("MONGO_URL")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "sb_tiffin")

if not MONGO_URL:
    raise RuntimeError("❌ MONGO_URL is missing in environment variables")


# =========================
# REDIS CONFIG
# =========================
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_ENABLED = os.getenv("REDIS_ENABLED", "true").lower() == "true"


# =========================
# CORS CONFIG
# =========================
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


# =========================
# DEBUG LOGGING
# =========================
DEBUG = ENVIRONMENT != "production"
