from fastapi import APIRouter, Depends, HTTPException
from app.database import db
from app.dependencies import get_current_user
from app.models.address_model import AddressCreate
from bson import ObjectId
from app.utils.cache import get_cache, set_cache, invalidate_cache

router = APIRouter(prefix="/addresses", tags=["Addresses"])
collection = db.addresses


@router.get("/")
async def get_addresses(user=Depends(get_current_user)):
    cache_key = f"addresses:list:{user['email']}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    addresses = list(collection.find({"user_email": user["email"]}, {"_id": 0}))
    set_cache(cache_key, addresses, expire_time=600)
    return addresses


@router.get("/default")
async def get_default_address(user=Depends(get_current_user)):
    cache_key = f"addresses:default:{user['email']}"
    cached = get_cache(cache_key)
    if cached:
        return cached
    
    address = collection.find_one(
        {"user_email": user["email"], "isDefault": True},
        {"_id": 0}
    )
    
    if not address:
        raise HTTPException(status_code=404, detail="No default address found")
    
    set_cache(cache_key, address, expire_time=600)
    return address


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
    
    # Invalidate cache
    invalidate_cache(f"addresses:list:{user['email']}", f"addresses:default:{user['email']}")
    
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
    
    # Invalidate cache
    invalidate_cache(f"addresses:list:{user['email']}", f"addresses:default:{user['email']}")

    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")

    return {"success": True, "message": "Address updated"}


@router.delete("/{address_id}")
async def delete_address(address_id: str, user=Depends(get_current_user)):
    result = collection.delete_one(
        {"id": address_id, "user_email": user["email"]}
    )
    
    # Invalidate cache
    invalidate_cache(f"addresses:list:{user['email']}", f"addresses:default:{user['email']}")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")
    
    return {"success": True, "message": "Address deleted"}
