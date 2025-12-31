from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class OrderItem(BaseModel):
    id: str
    name: str
    price: float
    quantity: int
    image_url: Optional[str] = None


class OrderCreate(BaseModel):
    items: List[OrderItem]
    total_amount: float = Field(..., gt=0)
    payment_method: Optional[str] = "card"  # card, upi, net, cod
    delivery_address: Optional[Dict[str, Any]] = None  # Store delivery address


class OrderResponse(BaseModel):
    order_id: str
    total_amount: float
    payment_status: str
