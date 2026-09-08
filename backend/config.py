"""Astitva Real Estate - Configuration & Database Client
"""
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("astitva")

# MongoDB
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "astitva_db")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# JWT & Auth
JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ.get("JWT_SECRET", "astitva-secret-key-change-in-prod")
ACCESS_EXPIRES_MIN = 60 * 12  # 12 hours for admin convenience
REFRESH_EXPIRES_DAYS = 7
VALID_ROLES = {"admin", "sales", "marketing"}

# App & Integrations
APP_NAME = os.environ.get("APP_NAME", "astitva-realestate")
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
SITE_URL = os.environ.get("SITE_URL", "https://astittva.in")
STATIC_DIR = ROOT_DIR.parent / "frontend" / "build"
