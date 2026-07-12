import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from contextlib import asynccontextmanager
import os

from core.indexes import create_indexes
from core.config import PROJECT_ENVIRONMENT, FRONTEND_URI, SESSION_SECRET

# ROUTER IMPORTS
from routers.auth_routes import router as auth_router
from routers.department_routes import router as department_router
from routers.category_routes import router as category_router
from routers.employee_routes import router as employee_router
from routers.asset_routes import router as asset_router
from routers.allocation_routes import router as allocation_router
from routers.transfer_routes import router as transfer_router
from routers.booking_routes import router as booking_router
from routers.maintenance_routes import router as maintenance_router
from routers.audit_routes import router as audit_router
from routers.dashboard_routes import router as dashboard_router
from routers.notification_routes import router as notification_router
from routers.activity_log_routes import router as activity_log_router
from routers.report_routes import router as report_router
from routers.ai_routes import router as ai_router

from core.limiter import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup database indexes
    await create_indexes()
    
    # Run the seed admin task on startup automatically
    try:
        from utils.seed_admin import seed_admin
        await seed_admin()
    except Exception as e:
        print(f"Error seeding admin: {e}")
        
    yield

app = FastAPI(
    title="AssetFlow ERP API",
    description="Backend API for Enterprise Asset & Resource Management System",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# CORS configuration
is_prod = PROJECT_ENVIRONMENT == "PRODUCTION"

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    same_site="none" if is_prod else "lax",
    https_only=is_prod,
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

if FRONTEND_URI:
    clean_frontend_uri = FRONTEND_URI.strip('"\'').rstrip('/')
    if clean_frontend_uri and clean_frontend_uri not in origins:
        origins.append(clean_frontend_uri)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled exception: {exc}")
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "success": False},
    )

# INCLUDE ROUTERS
app.include_router(auth_router)
app.include_router(department_router)
app.include_router(category_router)
app.include_router(employee_router)
app.include_router(asset_router)
app.include_router(allocation_router)
app.include_router(transfer_router)
app.include_router(booking_router)
app.include_router(maintenance_router)
app.include_router(audit_router)
app.include_router(dashboard_router)
app.include_router(notification_router)
app.include_router(activity_log_router)
app.include_router(report_router)
app.include_router(ai_router)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "success": True,
        "message": "AssetFlow API is running"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8001)),
        reload=True,
        log_level="info",
    )
