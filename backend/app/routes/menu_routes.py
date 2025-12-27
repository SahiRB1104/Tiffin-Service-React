from fastapi import APIRouter
from app.database import menu_col

router = APIRouter(prefix="/menu", tags=["Menu"])

@router.get("/", dependencies=[])  # 👈 no auth dependency
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
