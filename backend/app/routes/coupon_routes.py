from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/coupons", tags=["Coupons"])

# Sample coupons (in production, store in database)
COUPONS = {
    "WELCOME10": {
        "name": "WELCOME10",
        "description": "Get 10% off on your first order",
        "discount_type": "percentage",
        "discount_value": 10,
        "min_order": 100,
        "max_discount": 50,
    },
    "FLAT50": {
        "name": "FLAT50",
        "description": "Flat ₹50 off on orders above ₹200",
        "discount_type": "flat",
        "discount_value": 50,
        "min_order": 200,
        "max_discount": 50,
    },
    "SAVE20": {
        "name": "SAVE20",
        "description": "Save 20% on orders above ₹300",
        "discount_type": "percentage",
        "discount_value": 20,
        "min_order": 300,
        "max_discount": 100,
    },
    "BIGSALE": {
        "name": "BIGSALE",
        "description": "Mega discount! 25% off on orders above ₹500",
        "discount_type": "percentage",
        "discount_value": 25,
        "min_order": 500,
        "max_discount": 150,
    },
}


class CouponValidate(BaseModel):
    coupon_code: str
    order_amount: float


@router.get("/list")
def get_all_coupons():
    """Get all available coupons/offers"""
    return {
        "success": True,
        "coupons": list(COUPONS.values())
    }


@router.post("/validate")
def validate_coupon(data: CouponValidate):
    """Validate and apply coupon"""
    coupon_code = data.coupon_code.upper().strip()
    
    if coupon_code not in COUPONS:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    
    coupon = COUPONS[coupon_code]
    
    # Check minimum order requirement
    if data.order_amount < coupon["min_order"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Minimum order of ₹{coupon['min_order']} required"
        )
    
    # Calculate discount
    if coupon["discount_type"] == "percentage":
        discount = (data.order_amount * coupon["discount_value"]) / 100
        discount = min(discount, coupon["max_discount"])
    else:  # flat
        discount = coupon["discount_value"]
    
    final_amount = data.order_amount - discount
    
    return {
        "success": True,
        "coupon_name": coupon["name"],
        "description": coupon["description"],
        "discount_amount": round(discount, 2),
        "final_amount": round(final_amount, 2),
        "original_amount": data.order_amount
    }
