from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import health, dashboard, calls, product, settings as settings_router, websocket
from app.services.product_service import get_or_create_product_config, get_or_create_system_settings

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent AI Voice Sales Agent Platform API"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev, can be constrained by settings.CORS_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # Initialize default singletons in DB
    db = SessionLocal()
    try:
        get_or_create_product_config(db)
        get_or_create_system_settings(db)
    finally:
        db.close()

# Include routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(calls.router, prefix=settings.API_V1_STR)
app.include_router(product.router, prefix=settings.API_V1_STR)
app.include_router(settings_router.router, prefix=settings.API_V1_STR)
app.include_router(websocket.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to VoxSell AI – Intelligent Voice Sales Agent API",
        "docs": "/docs",
        "health": "/api/health"
    }
