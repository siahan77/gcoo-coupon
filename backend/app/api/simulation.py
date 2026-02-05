"""
Simulation API - 쿠폰 할인 시뮬레이션
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.coupon import Coupon
from app.models.coupon_type import CouponType
from app.schemas.simulation import SimulationRequest, SimulationResult, TripInput
from app.schemas.coupon_type import EligibilityRules, DiscountRules
from app.engine.simulator import coupon_simulator

router = APIRouter()


@router.post("", response_model=SimulationResult)
def simulate(
    request: SimulationRequest,
    db: Session = Depends(get_db),
):
    """
    쿠폰 할인 시뮬레이션
    
    - 쿠폰 ID와 트립 데이터를 입력받아 할인 금액을 계산합니다.
    - 적용 조건, 각 scope별 할인, 최종 금액을 반환합니다.
    """
    # 쿠폰 조회
    coupon = db.query(Coupon).filter(Coupon.id == request.coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="쿠폰을 찾을 수 없습니다")
    
    # 쿠폰 타입 조회
    coupon_type = db.query(CouponType).filter(
        CouponType.id == coupon.coupon_type_id
    ).first()
    if not coupon_type:
        raise HTTPException(status_code=404, detail="쿠폰 타입을 찾을 수 없습니다")
    
    # JSON 필드를 Pydantic 모델로 변환
    eligibility_rules = None
    if coupon_type.eligibility_rules:
        eligibility_rules = EligibilityRules(**coupon_type.eligibility_rules)
    
    discount_rules = None
    if coupon_type.discount_rules:
        discount_rules = DiscountRules(**coupon_type.discount_rules)
    
    # 시뮬레이션 실행
    result = coupon_simulator.simulate(
        coupon_id=coupon.id,
        coupon_type_id=coupon_type.id,
        coupon_type_name=coupon_type.name,
        eligibility_rules=eligibility_rules,
        discount_rules=discount_rules,
        coupon_value=coupon.value,  # float 또는 None
        trip=request.trip,
    )
    
    return result


@router.post("/preview", response_model=SimulationResult)
def simulate_preview(
    coupon_type_id: str,
    coupon_value: Optional[dict],
    trip: TripInput,
    db: Session = Depends(get_db),
):
    """
    쿠폰 타입 기반 시뮬레이션 미리보기
    
    - 쿠폰을 생성하지 않고 쿠폰 타입과 임시 값으로 시뮬레이션합니다.
    - 쿠폰 타입 빌더에서 미리보기용으로 사용합니다.
    """
    # 쿠폰 타입 조회
    coupon_type = db.query(CouponType).filter(CouponType.id == coupon_type_id).first()
    if not coupon_type:
        raise HTTPException(status_code=404, detail="쿠폰 타입을 찾을 수 없습니다")
    
    # JSON 필드를 Pydantic 모델로 변환
    eligibility_rules = None
    if coupon_type.eligibility_rules:
        eligibility_rules = EligibilityRules(**coupon_type.eligibility_rules)
    
    discount_rules = None
    if coupon_type.discount_rules:
        discount_rules = DiscountRules(**coupon_type.discount_rules)
    
    # 시뮬레이션 실행
    result = coupon_simulator.simulate(
        coupon_id="preview",
        coupon_type_id=coupon_type.id,
        coupon_type_name=coupon_type.name,
        eligibility_rules=eligibility_rules,
        discount_rules=discount_rules,
        coupon_value=coupon_value,
        trip=trip,
    )
    
    return result
