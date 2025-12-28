from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes import (
    auth_routes,
    user_routes,
    menu_routes,
    order_routes,
    payment_routes,
    review_routes,
    address_routes
)
from app.config import FRONTEND_URL
app = FastAPI(title="SB Tiffin Backend")

# ✅ CORS FIX (REQUIRED)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],        # GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],        # Content-Type, Authorization
)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(menu_routes.router)
app.include_router(order_routes.router)
app.include_router(payment_routes.router)
app.include_router(review_routes.router)
app.include_router(address_routes.router)

# ✅ Serve static files
app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)

@app.get("/")
def root():
    return {"status": "Backend running successfully"}
