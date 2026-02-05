from enum import Enum


class DiscountScope(str, Enum):
    """할인 대상 scope"""
    UNLOCK = "UNLOCK"  # 잠금해제 비용
    RIDE = "RIDE"      # 탑승 이용요금
    ORDER = "ORDER"    # 주문단위


class ConditionOperator(str, Enum):
    """조건 연산자"""
    GTE = "gte"  # 이상 (>=)
    LTE = "lte"  # 이하 (<=)
    GT = "gt"    # 초과 (>)
    LT = "lt"    # 미만 (<)
    EQ = "eq"    # 같음 (==)


class ConditionLogic(str, Enum):
    """조건 논리 연산자"""
    AND = "AND"
    OR = "OR"


class ConditionField(str, Enum):
    """조건에 사용할 수 있는 필드"""
    RIDE_DISTANCE = "ride_distance"              # 탑승 거리(km)
    RIDE_TIME = "ride_time"                      # 탑승 시간(분)
    PRICING_ORDER_AMOUNT = "pricing_order_amount"  # 주문금액


class WindowType(str, Enum):
    """적용 구간 규칙 (RIDE scope 전용)"""
    ALL = "ALL"              # 전체 구간
    FIRST_N = "FIRST_N"      # 처음 N분/km
    AFTER_N = "AFTER_N"      # N분/km 이후
    BETWEEN_A_B = "BETWEEN_A_B"  # A~B 구간


class DiscountAxis(str, Enum):
    """
    할인 환산 기준 (패스 적용용)
    
    - NONE: 금액 그대로 사용
    - TIME: pass_time × min_rate 기준
    - DISTANCE: pass_distance / ride_distance 비율 기준
    """
    NONE = "NONE"        # 없음 (금액 그대로)
    TIME = "TIME"        # 시간 기준 (시간패스)
    DISTANCE = "DISTANCE"  # 거리 기준 (거리패스)


class DiscountUnit(str, Enum):
    """할인 단위"""
    NONE = "NONE"        # 없음 (할인 없음)
    PERCENT = "PERCENT"  # 퍼센트
    AMOUNT = "AMOUNT"    # 금액


class CapRuleType(str, Enum):
    """할인 상한 규칙"""
    SCOPE_DISCOUNT = "SCOPE_DISCOUNT"      # 해당 scope 할인 금액 상한
    FINAL_PAYABLE_AMOUNT = "FINAL_PAYABLE_AMOUNT"  # 최소 결제 금액 보장


# 하위 호환성을 위한 별칭 (deprecated)
RangeRuleType = WindowType
ConversionBasis = DiscountAxis
