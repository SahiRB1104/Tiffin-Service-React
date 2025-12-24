import redis
from app.config import REDIS_HOST, REDIS_PORT, REDIS_ENABLED

_redis_client = None


def get_redis():
    global _redis_client

    if not REDIS_ENABLED:
        return None

    if _redis_client is None:
        try:
            _redis_client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
            )
            _redis_client.ping()
            print("✓ Redis connected")
        except Exception as e:
            print(f"⚠ Redis unavailable: {e}")
            _redis_client = None

    return _redis_client
