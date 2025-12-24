from pymongo import MongoClient
from dotenv import load_dotenv
import os



from app.config import MONGO_URL, MONGO_DB_NAME

client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
db = client[MONGO_DB_NAME]


try:
    client.admin.command("ping")
    print("✓ MongoDB connected")
except Exception as e:
    raise RuntimeError(f"MongoDB connection failed: {e}")

users_col = db["users"]
menu_col = db["menu"]
orders_col = db["orders"]
reviews_col = db["reviews"]
