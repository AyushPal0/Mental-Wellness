import os
import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

logger = logging.getLogger(__name__)

db = None

def init_db(app):
    global db
    # Get MongoDB URI from environment variable or use default
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    db_name = os.getenv('DB_NAME', 'mental_wellness')

    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # Test the connection
        client.admin.command('ping')
        db = client[db_name]
        logger.info(f"✅ Connected to MongoDB database: {db_name}")
    except ConnectionFailure as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        logger.error("Please ensure MongoDB is running and the URI is correct.")
        raise e
    except Exception as e:
        logger.error(f"❌ MongoDB initialization error: {e}")
        raise e
