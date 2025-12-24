from fastapi import APIRouter
from app.database import menu_col

router = APIRouter(prefix="/menu", tags=["Menu"])

@router.get("/")
def get_menu():
    return list(menu_col.find({}, {"_id": 0}))
