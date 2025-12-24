from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
import uuid

from app.dependencies import get_current_user
from app.database import orders_col
from app.models.order_model import OrderCreate

router = APIRouter(prefix="/payment", tags=["Payment"])


@router.post("/checkout")
def dummy_checkout(
    data: OrderCreate,
    user=Depends(get_current_user)
):
    """
    Dummy payment gateway.
    Always returns SUCCESS.
    Order is created ONLY here.
    """

    if not data.items:
        raise HTTPException(status_code=400, detail="Order items cannot be empty")

    order = {
        "order_id": f"ORD_{uuid.uuid4().hex[:8]}",
        "user_email": user["email"],
        "items": [item.model_dump() for item in data.items],
        "total_amount": data.total_amount,
        "payment_gateway": "DUMMY",
        "payment_status": "SUCCESS",
        "created_at": datetime.utcnow(),
    }

    orders_col.insert_one(order)

    return {
        "message": "Payment successful (Dummy Gateway)",
        "order_id": order["order_id"],
        "payment_status": "SUCCESS"
    }
