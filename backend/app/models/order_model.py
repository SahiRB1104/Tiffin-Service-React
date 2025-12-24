from pydantic import BaseModel, Field
from typing import List, Optional


class OrderItem(BaseModel):
    name: str
    quantity: int = Field(..., gt=0)
    price: float = Field(..., gt=0)


class OrderCreate(BaseModel):
    items: List[OrderItem]
    total_amount: float = Field(..., gt=0)


class OrderResponse(BaseModel):
    order_id: str
    total_amount: float
    payment_status: str
