from fastapi import APIRouter, Depends, HTTPException
from app.database import db
from app.dependencies import get_current_user
from app.models.address_model import AddressCreate
from bson import ObjectId

router = APIRouter(prefix="/addresses", tags=["Addresses"])
collection = db.addresses


@router.get("/")
async def get_addresses(user=Depends(get_current_user)):
    # Fixed: use user["email"] instead of user["id"]
    return list(collection.find({"user_email": user["email"]}, {"_id": 0}))


@router.post("/")
async def add_address(data: dict, user=Depends(get_current_user)):
    if data.get("is_default"):
        collection.update_many(
            {"user_email": user["email"]},
            {"$set": {"is_default": False}}
        )

    address = {
        "id": str(ObjectId()),
        "user_email": user["email"],
        "label": data.get("label", "Home"),
        "addressLine": data.get("addressLine", ""),
        "city": data.get("city", ""),
        "state": data.get("state", ""),
        "pincode": data.get("pincode", ""),
        "isDefault": data.get("isDefault", False),
    }

    result = collection.insert_one(address)
    address["_id"] = str(result.inserted_id)
    return address


@router.put("/{address_id}")
async def update_address(address_id: str, data: dict, user=Depends(get_current_user)):
    if data.get("isDefault"):
        collection.update_many(
            {"user_email": user["email"]},
            {"$set": {"isDefault": False}}
        )

    update_data = {
        "label": data.get("label"),
        "addressLine": data.get("addressLine"),
        "city": data.get("city"),
        "state": data.get("state"),
        "pincode": data.get("pincode"),
        "isDefault": data.get("isDefault", False),
    }

    res = collection.update_one(
        {"id": address_id, "user_email": user["email"]},
        {"$set": update_data}
    )

    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")

    return {"success": True, "message": "Address updated"}


@router.delete("/{address_id}")
async def delete_address(address_id: str, user=Depends(get_current_user)):
    result = collection.delete_one(
        {"id": address_id, "user_email": user["email"]}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")
    
    return {"success": True, "message": "Address deleted"}
