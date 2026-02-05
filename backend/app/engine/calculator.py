"""
Discount Calculator - 할인 계산 엔진

각 scope(UNLOCK, RIDE, ORDER)별 할인 금액을 계산합니다.

플로우 (원본 문서 기준):
1. 할인 대상 금액 결정 (scope_amount)
2. 적용 구간 적용 (window) → scope_amount_window
3. 환산 기준 적용 (discount_axis) → base_amount
4. 할인 단위 적용 (discount_unit) → calculated_discount
5. 결과 제한 적용 (cap_rule) → final_discount
6. 대상 금액 초과 방지
"""

from typing import List, Optional, Dict
from dataclasses import dataclass, field
from app.models.enums import (
    DiscountScope,
    WindowType,
    DiscountAxis,
    DiscountUnit,
    CapRuleType,
)
from app.schemas.coupon_type import ScopeConfig, WindowRule, CapRule
from app.schemas.simulation import TripInput


@dataclass
class ScopeCalculationResult:
    """개별 scope 계산 결과"""
    scope: DiscountScope
    enabled: bool
    target_amount: float = 0.0           # scope_amount
    window_amount: float = 0.0           # scope_amount_window
    base_amount: float = 0.0             # axis 적용 후
    calculated_discount: float = 0.0     # unit 적용 후
    capped_discount: float = 0.0         # cap 적용 후
    final_discount: float = 0.0          # 최종 할인
    calculation_steps: List[str] = field(default_factory=list)


class DiscountCalculator:
    """할인 계산기"""
    
    def calculate_scope(
        self,
        scope_config: ScopeConfig,
        trip: TripInput,
        coupon_value: Optional[Dict[str, dict]],
    ) -> ScopeCalculationResult:
        """
        개별 scope 할인 계산
        
        Args:
            scope_config: scope 설정
            trip: 트립 데이터
            coupon_value: 쿠폰 값 { "UNLOCK": { "discount": 50, "cap": 1000 }, ... }
            
        Returns:
            ScopeCalculationResult
        """
        result = ScopeCalculationResult(
            scope=scope_config.scope,
            enabled=scope_config.enabled,
        )
        
        # 비활성화된 scope는 건너뛰기
        if not scope_config.enabled:
            result.calculation_steps.append(f"[{scope_config.scope.value}] 비활성화됨")
            return result
        
        steps = result.calculation_steps
        steps.append(f"=== {scope_config.scope.value} 할인 계산 ===")
        
        # 쿠폰에서 해당 scope 값 가져오기
        scope_key = scope_config.scope.value  # "UNLOCK", "RIDE", "ORDER"
        scope_val = coupon_value.get(scope_key, {}) if coupon_value else {}
        
        # 할인 값 결정 (쿠폰 value.discount > default_value)
        discount_value = None
        
        # 1. 쿠폰에서 해당 scope의 discount 확인
        if isinstance(scope_val, dict) and "discount" in scope_val:
            discount_value = scope_val["discount"]
        elif isinstance(scope_val, (int, float)):
            # 하위 호환성: 기존 형식 { "UNLOCK": 50 }
            discount_value = scope_val
        
        # 2. 없으면 default_value 사용
        if discount_value is None:
            discount_value = scope_config.default_value
        
        # 3. 그래도 없으면 0
        if discount_value is None:
            discount_value = 0.0
        
        # 쿠폰에서 cap 오버라이드 확인
        coupon_cap = None
        if isinstance(scope_val, dict) and "cap" in scope_val:
            coupon_cap = scope_val["cap"]
        
        steps.append(f"   할인 값: {discount_value} (scope: {scope_key})")
        if coupon_cap is not None:
            steps.append(f"   쿠폰 상한: {coupon_cap}")
        
        # 1. 대상 금액 결정 (scope_amount)
        scope_amount = self._get_target_amount(scope_config.target_field, trip)
        result.target_amount = scope_amount
        steps.append(f"① scope_amount: {scope_amount:,.0f}원 ({scope_config.target_field})")
        
        if scope_amount <= 0:
            steps.append("   → 대상 금액이 0 이하, 할인 없음")
            return result
        
        # 2. 적용 구간 적용 (window) → scope_amount_window
        scope_amount_window = scope_amount
        if scope_config.scope == DiscountScope.RIDE and scope_config.window:
            scope_amount_window, window_steps = self._apply_window(
                scope_config.window,
                trip,
                scope_amount,
            )
            steps.extend(window_steps)
        else:
            steps.append(f"② scope_amount_window: {scope_amount_window:,.0f}원 (window 없음)")
        
        result.window_amount = scope_amount_window
        
        # 3. 환산 기준 적용 (discount_axis) → base_amount
        base_amount, axis_steps = self._apply_discount_axis(
            scope_config.discount_axis,
            scope_amount_window,
            trip,
        )
        steps.extend(axis_steps)
        result.base_amount = base_amount
        
        # 4. 할인 단위 적용 (discount_unit) → calculated_discount
        if scope_config.discount_unit == DiscountUnit.NONE:
            calculated_discount = 0.0
            steps.append(f"④ calculated_discount: 0원 (NONE)")
            
        elif scope_config.discount_unit == DiscountUnit.PERCENT:
            calculated_discount = base_amount * (discount_value / 100)
            steps.append(
                f"④ calculated_discount: {base_amount:,.0f} × {discount_value}% = {calculated_discount:,.0f}원"
            )
            
        elif scope_config.discount_unit == DiscountUnit.AMOUNT:
            calculated_discount = min(base_amount, discount_value)
            steps.append(
                f"④ calculated_discount: min({base_amount:,.0f}, {discount_value:,.0f}) = {calculated_discount:,.0f}원"
            )
        else:
            calculated_discount = 0.0
        
        result.calculated_discount = calculated_discount
        
        # 5. 결과 제한 적용 (cap_rule) → capped_discount
        # 쿠폰 cap 값이 있으면 우선 사용, 없으면 타입의 cap_rule.value 사용
        # FINAL_PAYABLE_AMOUNT는 window 적용 구간(scope_amount_window) 기준으로 계산
        capped_discount = calculated_discount
        if scope_config.cap_rule:
            capped_discount, cap_steps = self._apply_cap_rule(
                scope_config.cap_rule,
                calculated_discount,
                scope_amount_window,  # window 적용 구간 기준
                coupon_cap,  # 쿠폰에서 오버라이드된 cap 값
            )
            steps.extend(cap_steps)
        
        result.capped_discount = capped_discount
        
        # 6. 대상 금액 초과 방지
        final_discount = min(capped_discount, scope_amount)
        if final_discount < capped_discount:
            steps.append(
                f"⑥ 대상금액 상한: min({capped_discount:,.0f}, {scope_amount:,.0f}) = {final_discount:,.0f}원"
            )
        
        result.final_discount = max(0, final_discount)  # 음수 방지
        steps.append(f"★ final_discount: {result.final_discount:,.0f}원")
        
        return result
    
    def _get_target_amount(self, target_field: str, trip: TripInput) -> float:
        """대상 금액 가져오기"""
        return getattr(trip, target_field, 0.0)
    
    def _apply_window(
        self,
        window: WindowRule,
        trip: TripInput,
        scope_amount: float,
    ) -> tuple[float, List[str]]:
        """
        적용 구간 적용 (RIDE scope 전용)
        
        Returns:
            (scope_amount_window, 계산 과정)
        """
        steps = []
        
        # 시간 기준으로 비례배분
        total_time = trip.ride_time
        if total_time <= 0:
            steps.append(f"② scope_amount_window: {scope_amount:,.0f}원 (ride_time=0)")
            return scope_amount, steps
        
        rate_per_min = scope_amount / total_time  # 분당 금액
        
        if window.type == WindowType.ALL:
            applicable_time = total_time
            steps.append(f"② window(ALL): 전체 {total_time:.1f}분")
            
        elif window.type == WindowType.FIRST_N:
            n = window.n or 0
            applicable_time = min(n, total_time)
            steps.append(f"② window(FIRST_{n:.0f}): 처음 {applicable_time:.1f}분")
            
        elif window.type == WindowType.AFTER_N:
            n = window.n or 0
            applicable_time = max(0, total_time - n)
            steps.append(f"② window(AFTER_{n:.0f}): {n:.0f}분 이후 {applicable_time:.1f}분")
            
        elif window.type == WindowType.BETWEEN_A_B:
            a = window.a or 0
            b = window.b or total_time
            start = min(a, total_time)
            end = min(b, total_time)
            applicable_time = max(0, end - start)
            steps.append(f"② window(BETWEEN {a:.0f}~{b:.0f}): {applicable_time:.1f}분")
        else:
            applicable_time = total_time
        
        # 비례배분
        scope_amount_window = rate_per_min * applicable_time
        steps.append(
            f"   scope_amount_window: {rate_per_min:,.0f}원/분 × {applicable_time:.1f}분 = {scope_amount_window:,.0f}원"
        )
        
        return scope_amount_window, steps
    
    def _apply_discount_axis(
        self,
        axis: DiscountAxis,
        scope_amount_window: float,
        trip: TripInput,
    ) -> tuple[float, List[str]]:
        """
        환산 기준 적용 (패스 적용)
        
        - NONE: 금액 그대로
        - TIME: pass_time × min_rate 기준
        - DISTANCE: pass_distance / ride_distance 비율 기준
        
        Returns:
            (base_amount, 계산 과정)
        """
        steps = []
        
        if axis == DiscountAxis.NONE:
            base_amount = scope_amount_window
            steps.append(f"③ base_amount: {base_amount:,.0f}원 (axis=NONE)")
            
        elif axis == DiscountAxis.TIME:
            # base_amount = MIN(scope_amount_window, pass_time × min_rate)
            pass_amount = trip.pass_time * trip.min_rate
            base_amount = min(scope_amount_window, pass_amount)
            steps.append(
                f"③ base_amount(TIME): min({scope_amount_window:,.0f}, {trip.pass_time}분 × {trip.min_rate}원) = {base_amount:,.0f}원"
            )
            
        elif axis == DiscountAxis.DISTANCE:
            # base_amount = scope_amount_window × (pass_distance / ride_distance)
            if trip.ride_distance > 0:
                ratio = trip.pass_distance / trip.ride_distance
            else:
                ratio = 0
            base_amount = scope_amount_window * ratio
            steps.append(
                f"③ base_amount(DISTANCE): {scope_amount_window:,.0f} × ({trip.pass_distance}/{trip.ride_distance}) = {base_amount:,.0f}원"
            )
        else:
            base_amount = scope_amount_window
        
        return base_amount, steps
    
    def _apply_cap_rule(
        self,
        cap_rule: CapRule,
        calculated_discount: float,
        scope_amount: float,
        coupon_cap: Optional[float] = None,
    ) -> tuple[float, List[str]]:
        """
        결과 제한 적용
        
        Args:
            cap_rule: 쿠폰 타입의 cap 규칙
            calculated_discount: 계산된 할인액
            scope_amount: 대상 금액
            coupon_cap: 쿠폰에서 오버라이드된 cap 값 (있으면 우선 사용)
        
        Returns:
            (capped_discount, 계산 과정)
        """
        steps = []
        # 쿠폰 cap 우선, 없으면 타입의 cap_rule.value
        cap_value = coupon_cap if coupon_cap is not None else (cap_rule.value or 0)
        
        if cap_rule.type == CapRuleType.SCOPE_DISCOUNT:
            # 할인 금액 상한: min(calculated_discount, cap_value)
            if cap_value > 0:
                capped = min(calculated_discount, cap_value)
                steps.append(
                    f"⑤ cap(SCOPE_DISCOUNT): min({calculated_discount:,.0f}, {cap_value:,.0f}) = {capped:,.0f}원"
                )
                return capped, steps
                
        elif cap_rule.type == CapRuleType.FINAL_PAYABLE_AMOUNT:
            # 최소 결제 금액 보장: max(window_amount - cap_value, 0)
            # scope_amount는 실제로 window 적용 구간 금액(scope_amount_window)
            if cap_value > 0:
                max_discount = max(0, scope_amount - cap_value)
                capped = min(calculated_discount, max_discount)
                steps.append(
                    f"⑤ cap(FINAL_PAYABLE_AMOUNT): 구간 내 최소결제 {cap_value:,.0f}원 보장"
                )
                steps.append(
                    f"   구간 금액: {scope_amount:,.0f}원, 최대 할인: {scope_amount:,.0f} - {cap_value:,.0f} = {max_discount:,.0f}원"
                )
                return capped, steps
        
        return calculated_discount, steps


# 싱글톤 인스턴스
discount_calculator = DiscountCalculator()
