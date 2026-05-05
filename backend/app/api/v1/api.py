from fastapi import APIRouter
from app.api.v1.endpoints import auth, cattle, farm, analytics, users, admin

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(farm.router, prefix="/farms", tags=["farms"])
api_router.include_router(cattle.router, prefix="/cattle", tags=["cattle"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
