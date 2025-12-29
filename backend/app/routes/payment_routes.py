from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from datetime import datetime
import uuid, time

from app.dependencies import get_current_user
from app.database import orders_col
from app.models.order_model import OrderCreate

router = APIRouter(prefix="/payment", tags=["Payment"])


def auto_progress_order(order_id: str):
    """
    PLACED → PREPARING → DELIVERED
    """
    time.sleep(300)  # 5 minutes
    orders_col.update_one(
        {"order_id": order_id, "status": "PLACED"},
        {"$set": {"status": "PREPARING", "updated_at": datetime.utcnow()}}
    )

    time.sleep(1200)  # next 20 minutes
    orders_col.update_one(
        {"order_id": order_id, "status": "PREPARING"},
        {"$set": {"status": "DELIVERED", "updated_at": datetime.utcnow()}}
    )


@router.post("/checkout")
def dummy_checkout(
    data: OrderCreate,
    background_tasks: BackgroundTasks,
    user=Depends(get_current_user)
):
    if not data.items:
        raise HTTPException(status_code=400, detail="Order items cannot be empty")

    order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"

    # ✅ SNAPSHOT ORDER ITEMS (IMPORTANT FIX)
    order_items = []
    for item in data.items:
        item_dict = item.model_dump()

        order_items.append({
            "id": item_dict.get("id"),
            "name": item_dict["name"],
            "price": item_dict["price"],
            "quantity": item_dict["quantity"],

            # 🔑 CRITICAL: persist image snapshot
            "image_url": item_dict.get("image_url"),
        })

    order = {
        "order_id": order_id,
        "user_email": user["email"],
        "items": order_items,
        "total_amount": data.total_amount,
        "payment_method": data.payment_method,  # ✅ Store payment method
        "payment_gateway": "DUMMY",
        "payment_status": "SUCCESS",
        "status": "PLACED",
        "cancel_reason": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    orders_col.insert_one(order)

    # 🔁 Auto status lifecycle
    background_tasks.add_task(auto_progress_order, order_id)

    return {
        "message": "Payment successful",
        "order_id": order_id,
        "status": "PLACED"
    }
