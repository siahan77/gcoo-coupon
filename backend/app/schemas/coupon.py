from typing import Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime


class ScopeValue(BaseModel):
    """scope별 할인 값"""
    discount: float = Field(..., description="할인값 (퍼센트 또는 금액)")
    cap: Optional[float] = Field(None, description="상한값 (선택)")


class CouponBase(BaseModel):
    """쿠폰 기본 스키마"""
    coupon_type_id: str = Field(..., description="쿠폰 타입 ID")
    name: Optional[str] = Field(None, description="쿠폰명")
    # scope별 할인 값 { "UNLOCK": { "discount": 50, "cap": 1000 }, "RIDE": { "discount": 100 } }
    value: Optional[Dict[str, ScopeValue]] = Field(None, description="scope별 할인 값")
    valid_from: Optional[datetime] = Field(None, description="유효 시작일")
    valid_until: Optional[datetime] = Field(None, description="유효 종료일")


class CouponCreate(CouponBase):
    """쿠폰 생성 요청"""
    pass


class CouponUpdate(BaseModel):
    """쿠폰 수정 요청"""
    name: Optional[str] = None
    value: Optional[Dict[str, ScopeValue]] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None


class CouponResponse(CouponBase):
    """쿠폰 응답"""
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True
