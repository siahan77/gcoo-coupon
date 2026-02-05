from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base

# Import models to register them with SQLAlchemy
from app.models import CouponType, Coupon  # noqa: F401

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="쿠폰 할인 시뮬레이터 API",
    version="1.0.0",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Coupon Simulator API", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# API 라우터 등록
from app.api import api_router
app.include_router(api_router, prefix="/api")
