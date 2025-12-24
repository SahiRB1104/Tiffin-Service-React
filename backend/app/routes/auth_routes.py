from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database import users_col
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_token, verify_token
from app.models.user_model import UserRegister, UserLogin
from app.utils.redis_client import get_redis

router = APIRouter(prefix="/auth", tags=["Auth"])
security = HTTPBearer()


# =========================
# REGISTER
# =========================
@router.post("/register")
def register_user(data: UserRegister):
    if users_col.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="User already exists")

    users_col.insert_one({
        "email": data.email,
        "password": hash_password(data.password)
    })

    return {"message": "User registered successfully"}


# =========================
# LOGIN
# =========================
@router.post("/login")
def login_user(data: UserLogin):
    user = users_col.find_one({"email": data.email})

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token({"email": user["email"]})

    return {
        "access_token": token,
        "token_type": "Bearer"
    }


# =========================
# LOGOUT (SAFE)
# =========================
@router.post("/logout")
def logout_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    # Validate token first
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    redis_client = get_redis()

    # Blacklist token if Redis is available
    if redis_client:
        try:
            redis_client.setex(
                f"blacklist:{token}",
                60 * 60 * 24,  # 24 hours
                "revoked"
            )
        except Exception as e:
            # Do NOT crash logout if Redis fails
            print(f"⚠ Redis error during logout: {e}")

    return {"message": "Logged out successfully"}
