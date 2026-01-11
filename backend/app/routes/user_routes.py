from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, constr
from app.dependencies import get_current_user
from app.database import users_col
from app.utils.password import hash_password, verify_password
from app.utils.cache import invalidate_cache
from app.utils.redis_client import get_redis
import random
import string

router = APIRouter(prefix="/user", tags=["User"])


# =========================
# MODELS (LOCAL, SIMPLE)
# =========================

class UpdatePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)


class UpdatePhoneRequest(BaseModel):
    phone: constr(pattern=r"^\d{10}$") = Field(
        ..., description="10 digit phone number without separators"
    )
    verified: bool = Field(
        ..., description="Whether phone number was verified via OTP"
    )


class SendOTPRequest(BaseModel):
    phone: constr(pattern=r"^\d{10}$") = Field(
        ..., description="10 digit phone number without separators"
    )


class VerifyOTPRequest(BaseModel):
    phone: constr(pattern=r"^\d{10}$") = Field(
        ..., description="10 digit phone number without separators"
    )
    otp: constr(pattern=r"^\d{6}$") = Field(
        ..., description="6 digit OTP"
    )


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
    Requires verified OTP for security.
    """
    redis_client = get_redis()
    
    if not data.verified:
        raise HTTPException(
            status_code=400,
            detail="Phone number must be verified via OTP before updating"
        )
    
    # Check if phone was actually verified
    if redis_client:
        verification_key = f"phone_verified:{data.phone}"
        if not redis_client.get(verification_key):
            raise HTTPException(
                status_code=400,
                detail="Phone verification expired. Please verify again."
            )
        # Clean up verification token after use
        redis_client.delete(verification_key)
    
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

    return {
        "message": "Phone number updated successfully",
        "phone": data.phone
    }


# =========================
# SEND OTP TO PHONE
# =========================
@router.post("/send-otp")
def send_otp(data: SendOTPRequest):
    """
    Sends a 6-digit OTP to the provided phone number.
    OTP is valid for 10 minutes.
    """
    redis_client = get_redis()
    
    if not redis_client:
        raise HTTPException(
            status_code=500,
            detail="OTP service temporarily unavailable"
        )
    
    # Generate 6-digit OTP
    otp = ''.join(random.choices(string.digits, k=6))
    
    # Store OTP in Redis with 10-minute expiration
    otp_key = f"otp:{data.phone}"
    redis_client.setex(otp_key, 600, otp)  # 600 seconds = 10 minutes
    
    # TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    # For now, we're storing it in Redis
    # In production, send actual SMS:
    # sms_service.send_sms(phone=data.phone, message=f"Your OTP is: {otp}")
    
    print(f"📱 OTP for {data.phone}: {otp}")  # Debug log
    
    return {
        "message": "OTP sent successfully",
        "phone": data.phone,
        "expires_in": 600  # seconds
    }


# =========================
# VERIFY OTP
# =========================
@router.post("/verify-otp")
def verify_otp(data: VerifyOTPRequest):
    """
    Verifies the OTP sent to the phone number.
    Returns a verification token if OTP is correct.
    """
    redis_client = get_redis()
    
    if not redis_client:
        raise HTTPException(
            status_code=500,
            detail="OTP service temporarily unavailable"
        )
    
    # Retrieve stored OTP from Redis
    otp_key = f"otp:{data.phone}"
    stored_otp = redis_client.get(otp_key)
    
    if not stored_otp:
        raise HTTPException(
            status_code=400,
            detail="OTP expired or not found. Please request a new one."
        )
    
    # Handle both string and bytes responses from Redis
    stored_otp_str = stored_otp.decode() if isinstance(stored_otp, bytes) else stored_otp
    
    # Verify OTP
    if stored_otp_str != data.otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )
    
    # Remove OTP from Redis after successful verification
    redis_client.delete(otp_key)
    
    # Store verification token for phone update
    verification_key = f"phone_verified:{data.phone}"
    redis_client.setex(verification_key, 300, "verified")  # 5 minutes validity
    
    return {
        "message": "OTP verified successfully",
        "phone": data.phone,
        "verified": True
    }
