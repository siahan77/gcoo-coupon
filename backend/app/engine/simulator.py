"""
Coupon Simulator - 쿠폰 시뮬레이터

쿠폰 타입과 쿠폰 값을 기반으로 트립에 대한 할인 금액을 시뮬레이션합니다.

플로우:
1. 적용 조건 확인 (Eligibility)
2. 각 scope별 할인 계산 (UNLOCK, RIDE, ORDER)
3. 최종 할인 금액 합산
4. 결과 반환
"""

from typing import Optional, Dict
from app.models.enums import DiscountScope
from app.schemas.coupon_type import EligibilityRules, DiscountRules
from app.schemas.simulation import (
    TripInput,
    SimulationResult,
    DiscountBreakdown,
    ScopeResult,
)
from .eligibility import EligibilityEvaluator, eligibility_evaluator
from .calculator import DiscountCalculator, discount_calculator, ScopeCalculationResult


class CouponSimulator:
    """쿠폰 시뮬레이터"""
    
    def __init__(
        self,
        eligibility_eval: EligibilityEvaluator = eligibility_evaluator,
        calc: DiscountCalculator = discount_calculator,
    ):
        self.eligibility_eval = eligibility_eval
        self.calc = calc
    
    def simulate(
        self,
        coupon_id: str,
        coupon_type_id: str,
        coupon_type_name: str,
        eligibility_rules: Optional[EligibilityRules],
        discount_rules: Optional[DiscountRules],
        coupon_value: Optional[Dict[str, float]],
        trip: TripInput,
    ) -> SimulationResult:
        """
        쿠폰 할인 시뮬레이션 실행
        
        Args:
            coupon_id: 쿠폰 ID
            coupon_type_id: 쿠폰 타입 ID
            coupon_type_name: 쿠폰 타입명
            eligibility_rules: 적용 조건 규칙
            discount_rules: 할인 규칙
            coupon_value: 쿠폰 값 (할인율 또는 금액)
            trip: 트립 데이터
            
        Returns:
            SimulationResult
        """
        # 1. 적용 조건 확인
        eligibility_met, eligibility_details = self.eligibility_eval.evaluate(
            eligibility_rules, trip
        )
        
        # 초기 breakdown
        breakdown = DiscountBreakdown()
        
        # 초기 결과
        discount_unlock = 0.0
        discount_ride = 0.0
        discount_order = 0.0
        
        # 2. 적용 조건 충족 시에만 할인 계산
        if eligibility_met and discount_rules:
            # 각 scope별 할인 계산
            for scope_config in discount_rules.scopes:
                calc_result = self.calc.calculate_scope(
                    scope_config, trip, coupon_value
                )
                
                # 결과를 ScopeResult로 변환
                scope_result = self._to_scope_result(calc_result)
                
                # breakdown에 추가
                if scope_config.scope == DiscountScope.UNLOCK:
                    breakdown.unlock = scope_result
                    discount_unlock = scope_result.final_discount
                elif scope_config.scope == DiscountScope.RIDE:
                    breakdown.ride = scope_result
                    discount_ride = scope_result.final_discount
                elif scope_config.scope == DiscountScope.ORDER:
                    breakdown.order = scope_result
                    discount_order = scope_result.final_discount
        else:
            # 적용 조건 미충족 시
            eligibility_details.append("→ 적용 조건 미충족으로 모든 할인 = 0")
        
        # 3. 최종 계산
        total_discount = discount_unlock + discount_ride + discount_order
        original_amount = trip.pricing_order_amount
        final_amount = max(0, original_amount - total_discount)
        
        return SimulationResult(
            coupon_id=coupon_id,
            coupon_type_id=coupon_type_id,
            coupon_type_name=coupon_type_name,
            eligibility_met=eligibility_met,
            eligibility_details=eligibility_details,
            breakdown=breakdown,
            discount_unlock=discount_unlock,
            discount_ride=discount_ride,
            discount_order=discount_order,
            total_discount=total_discount,
            final_amount=final_amount,
            original_amount=original_amount,
        )
    
    def _to_scope_result(self, calc_result: ScopeCalculationResult) -> ScopeResult:
        """ScopeCalculationResult를 ScopeResult로 변환"""
        return ScopeResult(
            scope=calc_result.scope,
            enabled=calc_result.enabled,
            target_amount=calc_result.target_amount,
            calculated_discount=calc_result.calculated_discount,
            capped_discount=calc_result.capped_discount,
            final_discount=calc_result.final_discount,
            calculation_steps=calc_result.calculation_steps,
        )


# 싱글톤 인스턴스
coupon_simulator = CouponSimulator()
