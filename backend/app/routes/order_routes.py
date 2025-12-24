from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.database import orders_col

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/")
def get_my_orders(user=Depends(get_current_user)):
    """
    Returns only orders of the logged-in user.
    Orders are created via /payment/checkout only.
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
