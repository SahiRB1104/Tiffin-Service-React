from jose import jwt, JWTError
from datetime import datetime, timedelta
import os

from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_DAYS


def create_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
