from pydantic import BaseModel, EmailStr, Field


# =====================
# USER AUTH MODELS
# =====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


# =====================
# USER RESPONSE MODEL
# =====================

class UserResponse(BaseModel):
    email: EmailStr
    phone: str | None = None

    class Config:
        from_attributes = True
