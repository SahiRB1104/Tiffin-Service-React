from fastapi import APIRouter, Depends
from app.database import reviews_col
from app.dependencies import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("/")
def submit_review(data: dict, user=Depends(get_current_user)):
    data["user_email"] = user["email"]
    reviews_col.insert_one(data)
    return {"message": "Review submitted"}
