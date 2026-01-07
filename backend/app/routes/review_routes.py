from fastapi import APIRouter, Depends
from app.database import reviews_col
from app.dependencies import get_current_user
from app.utils.cache import get_cache, set_cache, invalidate_cache

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.get("/")
def get_reviews(user=Depends(get_current_user)):
    """
    Get all reviews submitted by current user - cached for 20 minutes
    """
    cache_key = f"reviews:user:{user['email']}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    reviews = list(reviews_col.find({"user_email": user["email"]}, {"_id": 0}))
    result = {"reviews": reviews}
    
    set_cache(cache_key, result, expire_time=1200)
    return result

@router.post("/")
def submit_review(data: dict, user=Depends(get_current_user)):
    data["user_email"] = user["email"]
    reviews_col.insert_one(data)
    
    # Invalidate review cache when new review is submitted
    invalidate_cache(f"reviews:user:{user['email']}")
    
    return {"message": "Review submitted"}
