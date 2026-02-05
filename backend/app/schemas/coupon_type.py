from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.enums import (
    ConditionOperator,
    ConditionLogic,
    ConditionField,
    DiscountScope,
    WindowType,
    DiscountAxis,
    DiscountUnit,
    CapRuleType,
)


# ============================================
# Eligibility Rules (적용 조건)
# ============================================

class Condition(BaseModel):
    """단일 조건"""
    field: ConditionField = Field(..., description="조건 필드")
    operator: ConditionOperator = Field(..., description="조건 연산자")
    value: float = Field(..., description="조건 값")


class EligibilityRules(BaseModel):
    """적용 조건 규칙"""
    conditions: List[Condition] = Field(default_factory=list, description="조건 목록")
    logic: ConditionLogic = Field(default=ConditionLogic.AND, description="조건 논리 연산자")


# ============================================
# Discount Rules (할인 규칙)
# ============================================

class WindowRule(BaseModel):
    """적용 구간 규칙 (RIDE scope 전용)"""
    type: WindowType = Field(..., description="구간 규칙 타입")
    n: Optional[float] = Field(None, description="N값 (FIRST_N, AFTER_N용)")
    a: Optional[float] = Field(None, description="A값 (BETWEEN_A_B용)")
    b: Optional[float] = Field(None, description="B값 (BETWEEN_A_B용)")


class CapRule(BaseModel):
    """할인 상한 규칙"""
    type: CapRuleType = Field(..., description="상한 규칙 타입")
    value: Optional[float] = Field(None, description="상한 값")


class ScopeConfig(BaseModel):
    """개별 scope 설정"""
    scope: DiscountScope = Field(..., description="할인 대상")
    enabled: bool = Field(default=True, description="활성화 여부")
    target_field: str = Field(..., description="할인 대상 필드 (unlock_fee, ride_fee, pricing_order_amount)")
    
    # RIDE scope 전용: 적용 구간
    window: Optional[WindowRule] = Field(None, description="적용 구간 (RIDE만)")
    
    # 환산 기준 (패스 적용)
    # - NONE: 금액 그대로
    # - TIME: pass_time × min_rate
    # - DISTANCE: pass_distance / ride_distance 비율
    discount_axis: DiscountAxis = Field(default=DiscountAxis.NONE, description="환산 기준 (패스 적용)")
    
    # 할인 단위 및 기본값
    discount_unit: DiscountUnit = Field(..., description="할인 단위")
    default_value: Optional[float] = Field(None, description="기본 할인 값 (쿠폰에서 override 가능)")
    
    # 상한 규칙
    cap_rule: Optional[CapRule] = Field(None, description="상한 규칙")


class DiscountRules(BaseModel):
    """할인 규칙"""
    scopes: List[ScopeConfig] = Field(default_factory=list, description="scope별 설정")


# ============================================
# API Schemas
# ============================================

class CouponTypeBase(BaseModel):
    """쿠폰 타입 기본 스키마"""
    name: str = Field(..., description="쿠폰 타입명")
    description: Optional[str] = Field(None, description="설명")
    eligibility_rules: Optional[EligibilityRules] = Field(None, description="적용 조건")
    discount_rules: Optional[DiscountRules] = Field(None, description="할인 규칙")
    is_active: bool = Field(default=True, description="활성화 여부")


class CouponTypeCreate(CouponTypeBase):
    """쿠폰 타입 생성 요청"""
    pass


class CouponTypeUpdate(BaseModel):
    """쿠폰 타입 수정 요청"""
    name: Optional[str] = None
    description: Optional[str] = None
    eligibility_rules: Optional[EligibilityRules] = None
    discount_rules: Optional[DiscountRules] = None
    is_active: Optional[bool] = None


class CouponTypeResponse(CouponTypeBase):
    """쿠폰 타입 응답"""
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
