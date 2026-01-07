"""
Redis Caching Utilities
Provides decorators and functions for caching API responses
"""

import json
import functools
from typing import Any, Optional, Callable
from app.utils.redis_client import get_redis


def cache_key(*args, prefix: str = "cache") -> str:
    """Generate cache key from function arguments"""
    key_parts = [prefix]
    for arg in args:
        if isinstance(arg, (str, int, float)):
            key_parts.append(str(arg))
    return ":".join(key_parts)


def cache(expire_time: int = 3600):
    """
    Decorator to cache function results in Redis
    
    Usage:
        @cache(expire_time=3600)  # Cache for 1 hour
        def get_menu():
            return expensive_operation()
    
    Args:
        expire_time: TTL in seconds (default: 1 hour)
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            redis_client = get_redis()
            if not redis_client:
                # If Redis unavailable, call function directly
                return func(*args, **kwargs)
            
            # Generate cache key
            key = cache_key(func.__name__, prefix="cache")
            
            # Try to get from cache
            try:
                cached = redis_client.get(key)
                if cached:
                    print(f"✓ Cache HIT: {key}")
                    return json.loads(cached)
            except Exception as e:
                print(f"⚠ Cache read error: {e}")
            
            # Cache miss - call function
            result = func(*args, **kwargs)
            
            # Store in cache
            try:
                redis_client.setex(
                    key,
                    expire_time,
                    json.dumps(result, default=str)
                )
                print(f"✓ Cached: {key} for {expire_time}s")
            except Exception as e:
                print(f"⚠ Cache write error: {e}")
            
            return result
        
        return wrapper
    return decorator


def cache_user(expire_time: int = 1800):
    """
    Cache user data with user ID
    
    Usage:
        @cache_user(expire_time=1800)  # 30 minutes
        def get_user_profile(user_id: str):
            return db.get_user(user_id)
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, user_id: str = None, **kwargs):
            redis_client = get_redis()
            if not redis_client or not user_id:
                return func(*args, user_id=user_id, **kwargs)
            
            # Generate user-specific cache key
            key = cache_key(func.__name__, user_id, prefix="user")
            
            try:
                cached = redis_client.get(key)
                if cached:
                    print(f"✓ User Cache HIT: {key}")
                    return json.loads(cached)
            except Exception as e:
                print(f"⚠ Cache read error: {e}")
            
            # Cache miss
            result = func(*args, user_id=user_id, **kwargs)
            
            try:
                redis_client.setex(
                    key,
                    expire_time,
                    json.dumps(result, default=str)
                )
            except Exception as e:
                print(f"⚠ Cache write error: {e}")
            
            return result
        
        return wrapper
    return decorator


def invalidate_cache(*keys: str):
    """
    Manually invalidate cache keys
    
    Usage:
        invalidate_cache("cache:get_menu")
        invalidate_cache("user:user123", "user:user456")
    """
    redis_client = get_redis()
    if not redis_client:
        return
    
    try:
        deleted = redis_client.delete(*keys)
        print(f"✓ Invalidated {deleted} cache keys")
    except Exception as e:
        print(f"⚠ Cache invalidation error: {e}")


def set_cache(key: str, value: Any, expire_time: int = 3600):
    """Manually set cache value"""
    redis_client = get_redis()
    if not redis_client:
        return
    
    try:
        redis_client.setex(key, expire_time, json.dumps(value, default=str))
        print(f"✓ Set cache: {key}")
    except Exception as e:
        print(f"⚠ Cache set error: {e}")


def get_cache(key: str):
    """Manually get cache value"""
    redis_client = get_redis()
    if not redis_client:
        return None
    
    try:
        cached = redis_client.get(key)
        if cached:
            return json.loads(cached)
    except Exception as e:
        print(f"⚠ Cache get error: {e}")
    
    return None


def clear_all_cache():
    """Clear all cache (use cautiously!)"""
    redis_client = get_redis()
    if not redis_client:
        return
    
    try:
        redis_client.flushdb()
        print("✓ All cache cleared")
    except Exception as e:
        print(f"⚠ Cache clear error: {e}")
