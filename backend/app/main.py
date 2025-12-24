from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import (
    auth_routes,
    user_routes,
    menu_routes,
    order_routes,
    payment_routes,
    review_routes
)
from app.config import FRONTEND_URL
app = FastAPI(title="SB Tiffin Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True
)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(menu_routes.router)
app.include_router(order_routes.router)
app.include_router(payment_routes.router)
app.include_router(review_routes.router)

@app.get("/")
def root():
    return {"status": "Backend running successfully"}
