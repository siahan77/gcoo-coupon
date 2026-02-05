// ============================================
// Enums
// ============================================

export enum DiscountScope {
  UNLOCK = 'UNLOCK',
  RIDE = 'RIDE',
  ORDER = 'ORDER',
}

export enum ConditionOperator {
  GTE = 'gte',
  LTE = 'lte',
  GT = 'gt',
  LT = 'lt',
  EQ = 'eq',
}

export enum ConditionLogic {
  AND = 'AND',
  OR = 'OR',
}

export enum ConditionField {
  RIDE_DISTANCE = 'ride_distance',
  RIDE_TIME = 'ride_time',
  PRICING_ORDER_AMOUNT = 'pricing_order_amount',
}

export enum WindowType {
  ALL = 'ALL',
  FIRST_N = 'FIRST_N',
  AFTER_N = 'AFTER_N',
  BETWEEN_A_B = 'BETWEEN_A_B',
}

export enum DiscountAxis {
  NONE = 'NONE',
  TIME = 'TIME',
  DISTANCE = 'DISTANCE',
}

export enum DiscountUnit {
  NONE = 'NONE',
  PERCENT = 'PERCENT',
  AMOUNT = 'AMOUNT',
}

export enum CapRuleType {
  SCOPE_DISCOUNT = 'SCOPE_DISCOUNT',
  FINAL_PAYABLE_AMOUNT = 'FINAL_PAYABLE_AMOUNT',
}

// ============================================
// Eligibility Rules (적용 조건)
// ============================================

export interface Condition {
  field: ConditionField;
  operator: ConditionOperator;
  value: number;
}

export interface EligibilityRules {
  conditions: Condition[];
  logic: ConditionLogic;
}

// ============================================
// Discount Rules (할인 규칙)
// ============================================

export interface WindowRule {
  type: WindowType;
  n?: number;
  a?: number;
  b?: number;
}

export interface CapRule {
  type: CapRuleType;
  value?: number;
}

export interface ScopeConfig {
  scope: DiscountScope;
  enabled: boolean;
  target_field: string;
  window?: WindowRule;           // 적용 구간 (RIDE만)
  discount_axis: DiscountAxis;   // 환산 기준 (패스 적용)
  discount_unit: DiscountUnit;   // 할인 단위
  default_value?: number;        // 기본 할인 값
  cap_rule?: CapRule;            // 상한 규칙
}

export interface DiscountRules {
  scopes: ScopeConfig[];
}

// ============================================
// Coupon Type
// ============================================

export interface CouponType {
  id: string;
  name: string;
  description?: string;
  eligibility_rules?: EligibilityRules;
  discount_rules?: DiscountRules;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponTypeCreate {
  name: string;
  description?: string;
  eligibility_rules?: EligibilityRules;
  discount_rules?: DiscountRules;
  is_active?: boolean;
}

// ============================================
// Coupon
// ============================================

// scope별 할인 값 구조
export interface ScopeValue {
  discount: number;  // 할인값 (퍼센트 또는 금액)
  cap?: number;      // 상한값 (선택)
}

export interface Coupon {
  id: string;
  coupon_type_id: string;
  name?: string;
  // scope별 할인 값 { "UNLOCK": { discount: 50, cap: 1000 }, "RIDE": { discount: 100, cap: 500 } }
  value?: Record<string, ScopeValue>;
  valid_from?: string;
  valid_until?: string;
  created_at: string;
}

export interface CouponCreate {
  coupon_type_id: string;
  name?: string;
  value?: Record<string, ScopeValue>;  // scope별 할인 값
  valid_from?: string;
  valid_until?: string;
}

// ============================================
// Simulation
// ============================================

export interface TripInput {
  unlock_fee: number;
  ride_fee: number;
  pricing_order_amount: number;
  min_rate: number;
  ride_time: number;
  lock_time: number;
  ride_distance: number;
  pass_time: number;
  pass_distance: number;
}

export interface SimulationRequest {
  coupon_id: string;
  trip: TripInput;
}

export interface ScopeResult {
  scope: DiscountScope;
  enabled: boolean;
  target_amount: number;
  calculated_discount: number;
  capped_discount: number;
  final_discount: number;
  calculation_steps: string[];
}

export interface DiscountBreakdown {
  unlock?: ScopeResult;
  ride?: ScopeResult;
  order?: ScopeResult;
}

export interface SimulationResult {
  coupon_id: string;
  coupon_type_id: string;
  coupon_type_name: string;
  eligibility_met: boolean;
  eligibility_details: string[];
  breakdown: DiscountBreakdown;
  discount_unlock: number;
  discount_ride: number;
  discount_order: number;
  total_discount: number;
  final_amount: number;
  original_amount: number;
}

// ============================================
// UI Labels
// ============================================

export const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  [ConditionOperator.GTE]: '이상 (≥)',
  [ConditionOperator.LTE]: '이하 (≤)',
  [ConditionOperator.GT]: '초과 (>)',
  [ConditionOperator.LT]: '미만 (<)',
  [ConditionOperator.EQ]: '같음 (=)',
};

export const FIELD_LABELS: Record<ConditionField, string> = {
  [ConditionField.RIDE_DISTANCE]: '탑승 거리 (km)',
  [ConditionField.RIDE_TIME]: '탑승 시간 (분)',
  [ConditionField.PRICING_ORDER_AMOUNT]: '주문 금액 (원)',
};

export const SCOPE_LABELS: Record<DiscountScope, string> = {
  [DiscountScope.UNLOCK]: '잠금해제 (UNLOCK)',
  [DiscountScope.RIDE]: '탑승이용 (RIDE)',
  [DiscountScope.ORDER]: '주문단위 (ORDER)',
};

export const WINDOW_TYPE_LABELS: Record<WindowType, string> = {
  [WindowType.ALL]: '전체 (ALL)',
  [WindowType.FIRST_N]: '처음 N (FIRST_N)',
  [WindowType.AFTER_N]: 'N 이후 (AFTER_N)',
  [WindowType.BETWEEN_A_B]: 'A~B 구간',
};

export const DISCOUNT_AXIS_LABELS: Record<DiscountAxis, string> = {
  [DiscountAxis.NONE]: '없음 (금액 그대로)',
  [DiscountAxis.TIME]: '시간패스 (pass_time)',
  [DiscountAxis.DISTANCE]: '거리패스 (pass_distance)',
};

export const DISCOUNT_UNIT_LABELS: Record<DiscountUnit, string> = {
  [DiscountUnit.NONE]: '없음',
  [DiscountUnit.PERCENT]: '퍼센트 (%)',
  [DiscountUnit.AMOUNT]: '금액 (원)',
};

export const CAP_RULE_LABELS: Record<CapRuleType, string> = {
  [CapRuleType.SCOPE_DISCOUNT]: '할인 금액 상한',
  [CapRuleType.FINAL_PAYABLE_AMOUNT]: '최소 결제 금액',
};
