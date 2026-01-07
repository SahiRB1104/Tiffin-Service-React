import redis
from app.config import REDIS_HOST, REDIS_PORT, REDIS_ENABLED

_redis_client = None


def get_redis():
    global _redis_client

    if not REDIS_ENABLED:
        print("⚠ Redis is DISABLED in config (REDIS_ENABLED=false)")
        return None

    if _redis_client is None:
        try:
            print(f"🔄 Attempting Redis connection to {REDIS_HOST}:{REDIS_PORT}...")
            _redis_client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
            )
            _redis_client.ping()
            print(f"✅ Redis connected successfully to {REDIS_HOST}:{REDIS_PORT}")
        except ConnectionRefusedError as e:
            print(f"❌ Redis connection refused - Server not running on {REDIS_HOST}:{REDIS_PORT}")
            print(f"   Error: {e}")
            _redis_client = None
        except TimeoutError as e:
            print(f"❌ Redis connection timeout - Server not responding")
            print(f"   Error: {e}")
            _redis_client = None
        except Exception as e:
            print(f"❌ Redis connection failed: {e}")
            print(f"   Host: {REDIS_HOST}, Port: {REDIS_PORT}")
            _redis_client = None

    return _redis_client
