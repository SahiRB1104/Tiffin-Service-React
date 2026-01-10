from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.utils.jwt import verify_token
from app.database import users_col
from app.utils.redis_client import get_redis

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    redis_client = get_redis()
    if redis_client and redis_client.get(f"blacklist:{token}"):
        raise HTTPException(status_code=401, detail="Token has been revoked")

    payload = verify_token(token)
    if not payload or "email" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = users_col.find_one({"email": payload["email"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Return only non-sensitive fields that downstream routes need
    return {
        "email": user.get("email"),
        "phone": user.get("phone"),
    }
