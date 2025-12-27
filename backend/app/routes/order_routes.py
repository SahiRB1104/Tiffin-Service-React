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


@router.get("/{order_id}")
def get_order_details(order_id: str, user=Depends(get_current_user)):
    order = orders_col.find_one(
        {
            "order_id": order_id,
            "user_email": user["email"]
        },
        {"_id": 0}
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order

@router.post("/{order_id}/cancel")
def cancel_order(
    order_id: str,
    payload: dict,
    user=Depends(get_current_user)
):
    reason = payload.get("reason")

    if not reason:
        raise HTTPException(status_code=400, detail="Cancel reason required")

    order = orders_col.find_one(
        {
            "order_id": order_id,
            "user_email": user["email"]
        }
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order["status"] != "PLACED":
        raise HTTPException(
            status_code=400,
            detail="Order cannot be cancelled at this stage"
        )

    orders_col.update_one(
        {"order_id": order_id},
        {
            "$set": {
                "status": "CANCELLED",
                "cancel_reason": reason,
                "updated_at": datetime.utcnow(),
            }
        }
    )

    return {"message": "Order cancelled successfully"}



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

