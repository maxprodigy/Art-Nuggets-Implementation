from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import init_db
from app.auth.routes import auth_router
from app.user_profile.routes import user_profile_router
from app.industry.routes import industry_router
from app.niche.routes import niche_router


@asynccontextmanager
async def life_span(app: FastAPI):
    print(f"Server is starting ...")
    await init_db()
    yield
    print(f"Server has been stopped ...")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix=f"/api/v1/auth", tags=["auth"])
app.include_router(user_profile_router, prefix=f"/api/v1", tags=["user-profile"])
app.include_router(industry_router, prefix=f"/api/v1", tags=["industries"])
app.include_router(niche_router, prefix=f"/api/v1", tags=["niches"])


@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.VERSION,
        "docs": "/docs",
    }
