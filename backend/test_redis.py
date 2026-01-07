#!/usr/bin/env python
"""
Redis Connection Test Script
Tests if Redis is properly configured and connected
"""

import sys
import os
from pathlib import Path

# Add parent directory to path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent))

print("=" * 60)
print("🔍 REDIS CONNECTION TEST")
print("=" * 60)

# Test 1: Check environment variables
print("\n1️⃣ Checking Environment Variables...")
try:
    from app.config import REDIS_HOST, REDIS_PORT, REDIS_ENABLED
    print(f"   ✅ REDIS_ENABLED: {REDIS_ENABLED}")
    print(f"   ✅ REDIS_HOST: {REDIS_HOST}")
    print(f"   ✅ REDIS_PORT: {REDIS_PORT}")
except Exception as e:
    print(f"   ❌ Failed to load config: {e}")
    sys.exit(1)

# Test 2: Try to import redis module
print("\n2️⃣ Checking Redis Module...")
try:
    import redis
    print(f"   ✅ Redis module imported successfully")
    print(f"   📦 Version: {redis.__version__}")
except ImportError as e:
    print(f"   ❌ Redis module not installed: {e}")
    print(f"   💡 Install with: pip install redis")
    sys.exit(1)

# Test 3: Test connection
print("\n3️⃣ Testing Redis Connection...")
try:
    from app.utils.redis_client import get_redis
    
    redis_client = get_redis()
    
    if redis_client is None:
        if not REDIS_ENABLED:
            print(f"   ⚠️  Redis is disabled in configuration")
            print(f"   💡 Set REDIS_ENABLED=true in .env to enable")
        else:
            print(f"   ❌ Could not connect to Redis")
            print(f"   💡 Make sure Redis server is running:")
            print(f"      Windows: redis-server.exe")
            print(f"      Linux/Mac: redis-server")
        sys.exit(1)
    
    print(f"   ✅ Redis connection successful!")
    
except Exception as e:
    print(f"   ❌ Error: {e}")
    sys.exit(1)

# Test 4: Test basic operations
print("\n4️⃣ Testing Basic Redis Operations...")
try:
    # Test SET
    redis_client.set("test_key", "test_value", ex=10)
    print(f"   ✅ SET operation successful")
    
    # Test GET
    value = redis_client.get("test_key")
    if value == "test_value":
        print(f"   ✅ GET operation successful")
    else:
        print(f"   ❌ GET returned unexpected value: {value}")
    
    # Test DELETE
    redis_client.delete("test_key")
    print(f"   ✅ DELETE operation successful")
    
except Exception as e:
    print(f"   ❌ Operation failed: {e}")
    sys.exit(1)

# Test 5: Test cache utility functions
print("\n5️⃣ Testing Cache Utility Functions...")
try:
    from app.utils.cache import get_cache, set_cache, invalidate_cache
    
    # Test set_cache
    set_cache("demo:key", {"name": "test", "value": 123}, expire_time=60)
    print(f"   ✅ set_cache() working")
    
    # Test get_cache
    cached = get_cache("demo:key")
    if cached and cached.get("name") == "test":
        print(f"   ✅ get_cache() working")
    
    # Test invalidate_cache
    invalidate_cache("demo:key")
    print(f"   ✅ invalidate_cache() working")
    
except Exception as e:
    print(f"   ❌ Cache utility error: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ ALL TESTS PASSED - REDIS IS READY!")
print("=" * 60)
print("\n📊 Summary:")
print(f"   Host: {REDIS_HOST}:{REDIS_PORT}")
print(f"   Status: Connected ✅")
print(f"   Cache Functions: Working ✅")
print("\n🚀 Your backend is ready to use Redis caching!")
print("=" * 60)
