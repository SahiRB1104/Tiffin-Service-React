from fastapi import APIRouter
from app.database import menu_col
from app.utils.cache import cache, invalidate_cache

router = APIRouter(prefix="/menu", tags=["Menu"])

@router.get("", dependencies=[])  # 👈 Match both /menu and /menu/
@router.get("/", dependencies=[])  # 👈 no auth dependency
@cache(expire_time=3600)  # Cache for 1 hour - menu rarely changes
def get_menu():
    menu = []

    for item in menu_col.find():
        menu.append({
            "id": f"MENU-{str(item['_id'])[-6:]}",
            "name": item["name"],
            "category": item.get("category", "general"),
            "rating": float(item.get("rating", 0)),
            "price": float(item["price"]),
            "image_url": ( f"/static/{item['img'].lstrip('/')}"
                    if item.get("img")
                    else ""
                ),
        })

    return {"menu": menu}
