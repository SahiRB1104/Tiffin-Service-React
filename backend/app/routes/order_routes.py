from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
import random
from app.dependencies import get_current_user
from app.database import orders_col

router = APIRouter(prefix="/orders", tags=["Orders"])


def generate_order_id():
    """
    Generates ORD-XXXXXX (e.g. ORD-493821)
    """
    return f"ORD-{random.randint(100000, 999999)}"


@router.get("/")
def get_my_orders(user=Depends(get_current_user)):
    """
    Returns only orders of the logged-in user.
    """
    orders = list(
        orders_col.find(
            {"user_email": user["email"]},
            {"_id": 0}
        )
    )

    return {
        "count": len(orders),
        "orders": orders
    }


@router.post("/checkout")
def place_order(payload: dict, user=Depends(get_current_user)):
    """
    Creates a new order after successful payment.
    """

    if not payload.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")

    if payload.get("payment_status") != "SUCCESS":
        raise HTTPException(status_code=402, detail="Payment failed")

    order = {
        "order_id": generate_order_id(),
        "user_email": user["email"],
        "items": payload["items"],
        "total_amount": payload["total_amount"],
        "payment_method": payload.get("payment_method", "unknown"),
        "status": "PLACED",  # 🔁 lifecycle start
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    orders_col.insert_one(order)

    return {
        "message": "Order placed successfully",
        "order_id": order["order_id"],
        "status": order["status"],
    }


@router.put("/{order_id}/status")
def update_order_status(
    order_id: str,
    payload: dict,
):
    """
    Updates order status: PLACED → PREPARING → DELIVERED
    (Admin / internal use)
    """

    new_status = payload.get("status")

    if new_status not in ["PLACED", "PREPARING", "DELIVERED"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    result = orders_col.update_one(
        {"order_id": order_id},
        {
            "$set": {
                "status": new_status,
                "updated_at": datetime.utcnow(),
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")

    return {"message": "Order status updated", "status": new_status}
