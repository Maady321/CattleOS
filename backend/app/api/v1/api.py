from fastapi import APIRouter
from app.api.v1.endpoints import auth, cattle, farm, analytics, users, admin, sync, messaging, billing, voice, veterinary, subsidy, cooperative, insurance, ops_consolidated, growth_ops, ecosystem, community, health_ops, trust_ops

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(farm.router, prefix="/farms", tags=["farms"])
api_router.include_router(cattle.router, prefix="/cattle", tags=["cattle"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(sync.router, prefix="/sync", tags=["sync"])
api_router.include_router(cooperative.router, prefix="/cooperative", tags=["cooperative"])
api_router.include_router(insurance.router, prefix="/insurance", tags=["insurance"])
api_router.include_router(ops_consolidated.router, prefix="/ops")
api_router.include_router(growth_ops.router, prefix="/ops/growth", tags=["growth_ops"])
api_router.include_router(ecosystem.router, prefix="/ecosystem", tags=["ecosystem"])
api_router.include_router(community.router, prefix="/community", tags=["community"])
api_router.include_router(health_ops.router, prefix="/health", tags=["health_ops"])
api_router.include_router(trust_ops.router, prefix="/trust", tags=["trust_ops"])
