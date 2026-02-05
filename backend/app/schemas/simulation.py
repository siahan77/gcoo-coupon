from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.enums import DiscountScope


class TripInput(BaseModel):
    """트립 데이터 입력"""
    unlock_fee: float = Field(..., description="잠금해제 비용")
    ride_fee: float = Field(..., description="탑승 이용 금액(전체)")
    pricing_order_amount: float = Field(..., description="쿠폰 외 할인이 적용된 주문금액")
    min_rate: float = Field(..., description="분당 요금제의 분당 요금")
    ride_time: float = Field(..., description="탑승 시간(분)")
    lock_time: float = Field(default=0, description="일시잠금 시간(분)")
    ride_distance: float = Field(..., description="탑승 거리(km)")
    pass_time: float = Field(default=0, description="시간패스 실제 적용 시간(분)")
    pass_distance: float = Field(default=0, description="거리패스 실제 적용 거리(km)")


class SimulationRequest(BaseModel):
    """시뮬레이션 요청"""
    coupon_id: str = Field(..., description="쿠폰 ID")
    trip: TripInput = Field(..., description="트립 데이터")


class ScopeResult(BaseModel):
    """개별 scope 계산 결과"""
    scope: DiscountScope = Field(..., description="할인 대상")
    enabled: bool = Field(..., description="활성화 여부")
    target_amount: float = Field(..., description="할인 대상 금액")
    calculated_discount: float = Field(..., description="계산된 할인 금액")
    capped_discount: float = Field(..., description="상한 적용 후 할인 금액")
    final_discount: float = Field(..., description="최종 할인 금액 (대상금액 초과 방지)")
    
    # 계산 과정 상세
    calculation_steps: List[str] = Field(default_factory=list, description="계산 과정")


class DiscountBreakdown(BaseModel):
    """할인 상세 내역"""
    unlock: Optional[ScopeResult] = Field(None, description="UNLOCK 결과")
    ride: Optional[ScopeResult] = Field(None, description="RIDE 결과")
    order: Optional[ScopeResult] = Field(None, description="ORDER 결과")


class SimulationResult(BaseModel):
    """시뮬레이션 결과"""
    # 쿠폰 정보
    coupon_id: str = Field(..., description="쿠폰 ID")
    coupon_type_id: str = Field(..., description="쿠폰 타입 ID")
    coupon_type_name: str = Field(..., description="쿠폰 타입명")
    
    # 적용 조건 결과
    eligibility_met: bool = Field(..., description="적용 조건 충족 여부")
    eligibility_details: List[str] = Field(default_factory=list, description="적용 조건 상세")
    
    # 할인 결과
    breakdown: DiscountBreakdown = Field(..., description="할인 상세 내역")
    
    # 최종 결과
    discount_unlock: float = Field(default=0, description="잠금해제 할인 금액")
    discount_ride: float = Field(default=0, description="탑승 이용 할인 금액")
    discount_order: float = Field(default=0, description="주문금액 할인 금액")
    total_discount: float = Field(..., description="최종 할인 금액")
    final_amount: float = Field(..., description="최종 결제 금액")
    
    # 원본 입력값
    original_amount: float = Field(..., description="원본 주문 금액")
