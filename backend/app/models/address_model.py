from pydantic import BaseModel, Field
from typing import Optional
from uuid import uuid4

class AddressCreate(BaseModel):
    label: str
    address: str
    is_default: bool = False

class Address(AddressCreate):
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
