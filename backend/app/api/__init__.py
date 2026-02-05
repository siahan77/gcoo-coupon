from fastapi import APIRouter
from .coupon_types import router as coupon_types_router
from .coupons import router as coupons_router
from .simulation import router as simulation_router

api_router = APIRouter()

api_router.include_router(coupon_types_router, prefix="/coupon-types", tags=["coupon-types"])
api_router.include_router(coupons_router, prefix="/coupons", tags=["coupons"])
api_router.include_router(simulation_router, prefix="/simulation", tags=["simulation"])
