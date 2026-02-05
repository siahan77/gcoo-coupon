"""
Eligibility Evaluator - 적용 조건 평가 로직

적용 조건(apply_rule.eligibility)을 확인하여 쿠폰 적용 가능 여부를 판단합니다.
- 총 탑승거리, 총 탑승시간, 쿠폰 외 할인이 제외된 주문금액
- 조건 연산자: 이상(gte), 이하(lte), 초과(gt), 미만(lt), 같음(eq)
"""

from typing import List, Tuple
from app.models.enums import ConditionOperator, ConditionLogic, ConditionField
from app.schemas.coupon_type import EligibilityRules, Condition
from app.schemas.simulation import TripInput


class EligibilityEvaluator:
    """적용 조건 평가기"""
    
    # 조건 필드와 TripInput 필드 매핑
    FIELD_MAPPING = {
        ConditionField.RIDE_DISTANCE: "ride_distance",
        ConditionField.RIDE_TIME: "ride_time",
        ConditionField.PRICING_ORDER_AMOUNT: "pricing_order_amount",
    }
    
    # 연산자별 비교 함수
    OPERATORS = {
        ConditionOperator.GTE: lambda a, b: a >= b,  # 이상
        ConditionOperator.LTE: lambda a, b: a <= b,  # 이하
        ConditionOperator.GT: lambda a, b: a > b,    # 초과
        ConditionOperator.LT: lambda a, b: a < b,    # 미만
        ConditionOperator.EQ: lambda a, b: a == b,   # 같음
    }
    
    # 연산자 한글 레이블
    OPERATOR_LABELS = {
        ConditionOperator.GTE: "≥",
        ConditionOperator.LTE: "≤",
        ConditionOperator.GT: ">",
        ConditionOperator.LT: "<",
        ConditionOperator.EQ: "=",
    }
    
    # 필드 한글 레이블
    FIELD_LABELS = {
        ConditionField.RIDE_DISTANCE: "탑승거리",
        ConditionField.RIDE_TIME: "탑승시간",
        ConditionField.PRICING_ORDER_AMOUNT: "주문금액",
    }
    
    # 필드 단위
    FIELD_UNITS = {
        ConditionField.RIDE_DISTANCE: "km",
        ConditionField.RIDE_TIME: "분",
        ConditionField.PRICING_ORDER_AMOUNT: "원",
    }
    
    def evaluate(
        self, 
        rules: EligibilityRules | None, 
        trip: TripInput
    ) -> Tuple[bool, List[str]]:
        """
        적용 조건 평가
        
        Args:
            rules: 적용 조건 규칙 (None이면 무조건 적용)
            trip: 트립 데이터
            
        Returns:
            (충족 여부, 상세 내역 리스트)
        """
        # 규칙이 없거나 조건이 없으면 무조건 적용
        if rules is None or not rules.conditions:
            return True, ["적용 조건 없음: 무조건 적용"]
        
        results: List[Tuple[bool, str]] = []
        
        for condition in rules.conditions:
            is_met, detail = self._evaluate_condition(condition, trip)
            results.append((is_met, detail))
        
        # 논리 연산 적용
        if rules.logic == ConditionLogic.AND:
            final_result = all(r[0] for r in results)
            logic_label = "AND (모두 충족)"
        else:  # OR
            final_result = any(r[0] for r in results)
            logic_label = "OR (하나라도 충족)"
        
        # 상세 내역 생성
        details = [f"조건 논리: {logic_label}"]
        for is_met, detail in results:
            status = "✅" if is_met else "❌"
            details.append(f"  {status} {detail}")
        
        details.append(f"최종 결과: {'✅ 충족' if final_result else '❌ 미충족'}")
        
        return final_result, details
    
    def _evaluate_condition(
        self, 
        condition: Condition, 
        trip: TripInput
    ) -> Tuple[bool, str]:
        """
        단일 조건 평가
        
        Args:
            condition: 조건
            trip: 트립 데이터
            
        Returns:
            (충족 여부, 상세 설명)
        """
        # 트립 데이터에서 값 추출
        field_name = self.FIELD_MAPPING.get(condition.field)
        if field_name is None:
            return False, f"알 수 없는 필드: {condition.field}"
        
        actual_value = getattr(trip, field_name, None)
        if actual_value is None:
            return False, f"필드 값 없음: {field_name}"
        
        # 연산자 함수 가져오기
        operator_func = self.OPERATORS.get(condition.operator)
        if operator_func is None:
            return False, f"알 수 없는 연산자: {condition.operator}"
        
        # 비교 수행
        is_met = operator_func(actual_value, condition.value)
        
        # 상세 설명 생성
        field_label = self.FIELD_LABELS.get(condition.field, condition.field)
        operator_label = self.OPERATOR_LABELS.get(condition.operator, condition.operator)
        unit = self.FIELD_UNITS.get(condition.field, "")
        
        detail = (
            f"{field_label}: {actual_value}{unit} {operator_label} {condition.value}{unit}"
        )
        
        return is_met, detail


# 싱글톤 인스턴스
eligibility_evaluator = EligibilityEvaluator()
