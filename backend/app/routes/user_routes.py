from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.dependencies import get_current_user
from app.database import users_col
from app.utils.password import hash_password, verify_password
from app.utils.cache import invalidate_cache

router = APIRouter(prefix="/user", tags=["User"])


# =========================
# MODELS (LOCAL, SIMPLE)
# =========================

class UpdatePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)


class UpdatePhoneRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)


# =========================
# GET PROFILE
# =========================
@router.get("/profile")
def get_profile(user=Depends(get_current_user)):
    """
    Returns authenticated user's profile.
    Password and internal fields are never exposed.
    Cache is managed automatically by JWT token.
    """

    return {
        "email": user["email"],
        "phone": user.get("phone")
    }


# =========================
# UPDATE PASSWORD
# =========================
@router.put("/update-password")
def update_password(
    data: UpdatePasswordRequest,
    user=Depends(get_current_user)
):
    db_user = users_col.find_one({"email": user["email"]})

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify current password
    if not verify_password(data.current_password, db_user["password"]):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    # Prevent same password reuse
    if verify_password(data.new_password, db_user["password"]):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from old password"
        )

    users_col.update_one(
        {"email": user["email"]},
        {"$set": {"password": hash_password(data.new_password)}}
    )
    
    # Invalidate any cached user data (if you implement it)
    invalidate_cache(f"user:profile:{user['email']}")

    return {
        "message": "Password updated successfully"
    }


# =========================
# UPDATE PHONE NUMBER
# =========================
@router.put("/update-phone")
def update_phone(
    data: UpdatePhoneRequest,
    user=Depends(get_current_user)
):
    """
    Updates the user's phone number.
    """
    db_user = users_col.find_one({"email": user["email"]})

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update phone number
    users_col.update_one(
        {"email": user["email"]},
        {"$set": {"phone": data.phone}}
    )
    
    # Invalidate any cached user data
    invalidate_cache(f"user:profile:{user['email']}")

    return {
        "message": "Phone number updated successfully",
        "phone": data.phone
    }
