# 쿠폰 시뮬레이터 작업 리스트

> 생성일: 2026-02-05
> 프로젝트: coupon_simulator

---

## 📋 이미지 분석 결과 (할인 산식 플로우)

### 1. 적용 조건 확인 (`apply_rule.eligibility`)
- 총 탑승거리, 총 탑승시간, 쿠폰 외 할인 제외 주문금액
- 조건 연산자: 이상, 이하, 초과, 미만, 같음

### 2. 할인 대상 (discount_scope) - 3가지 병렬 계산
- `UNLOCK` - 잠금해제 비용
- `RIDE` - 탑승 이용요금
- `ORDER` - 주문단위

### 3. 각 scope별 설정 항목

| 항목 | UNLOCK | RIDE | ORDER |
|------|--------|------|-------|
| 할인 대상 금액 | `unlock_fee` | `ride_fee` | `pricing_order_amt` |
| 할인 구간 규칙 | - | ALL, FIRST_N, AFTER_N, BETWEEN_A_B | - |
| 할인 환산 기준 | NONE | NONE, TIME, DISTANCE | NONE |
| 할인 단위 | NONE, PERCENT, AMOUNT | NONE, PERCENT, AMOUNT | NONE, PERCENT, AMOUNT |
| 할인 상한 규칙 | SCOPE_DISCOUNT, FINAL_PAYABLE_AMT | SCOPE_DISCOUNT, FINAL_PAYABLE_AMT | SCOPE_DISCOUNT, FINAL_PAYABLE_AMT |

### 4. 최종 계산
```
최종 할인 = discount_unlock + discount_ride + discount_order
```

---

## 🗄️ DB 구조 제안 (Low-code용 할인 산식 저장)

### 테이블 스키마

```sql
-- coupon_type 테이블
CREATE TABLE coupon_type (
    id              VARCHAR(36) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    
    -- 적용 조건 (JSON)
    eligibility_rules   JSON,
    
    -- 할인 규칙 (JSON) - 각 scope별 설정
    discount_rules      JSON,
    
    -- 메타데이터
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active       BOOLEAN DEFAULT TRUE
);

-- coupon 테이블 (실제 쿠폰 인스턴스)
CREATE TABLE coupon (
    id              VARCHAR(36) PRIMARY KEY,
    coupon_type_id  VARCHAR(36) REFERENCES coupon_type(id),
    
    -- 쿠폰별 값 (coupon_type의 규칙에서 참조)
    value           JSON,  -- { "amount": 1000, "percent": 10, ... }
    
    valid_from      TIMESTAMP,
    valid_until     TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### JSON 구조 예시

#### eligibility_rules
```json
{
  "conditions": [
    {
      "field": "ride_distance",
      "operator": "gte",
      "value": 1.0
    },
    {
      "field": "pricing_order_amount",
      "operator": "gte",
      "value": 5000
    }
  ],
  "logic": "AND"
}
```

#### discount_rules
```json
{
  "scopes": [
    {
      "scope": "UNLOCK",
      "enabled": true,
      "target_field": "unlock_fee",
      "conversion_basis": "NONE",
      "discount_unit": "PERCENT",
      "discount_value_ref": "unlock_percent",
      "cap_rule": {
        "type": "SCOPE_DISCOUNT",
        "max_value_ref": "unlock_max"
      }
    },
    {
      "scope": "RIDE",
      "enabled": true,
      "target_field": "ride_fee",
      "range_rule": {
        "type": "FIRST_N",
        "n_ref": "ride_first_minutes"
      },
      "conversion_basis": "TIME",
      "discount_unit": "AMOUNT",
      "discount_value_ref": "ride_amount_per_min",
      "cap_rule": {
        "type": "FINAL_PAYABLE_AMT",
        "max_value_ref": "ride_max"
      }
    },
    {
      "scope": "ORDER",
      "enabled": true,
      "target_field": "pricing_order_amount",
      "conversion_basis": "NONE",
      "discount_unit": "AMOUNT",
      "discount_value_ref": "order_discount",
      "cap_rule": {
        "type": "SCOPE_DISCOUNT",
        "max_value_ref": "order_max"
      }
    }
  ]
}
```

---

## 📝 전체 작업 리스트

### Phase 1: 설계 및 기초 구조 (Foundation) ✅ 완료

| # | 작업 | 설명 | 상태 |
|---|------|------|------|
| 1.1 | 데이터 모델 설계 | `coupon_type`, `coupon` 테이블 스키마 확정 | ✅ |
| 1.2 | JSON Schema 정의 | `eligibility_rules`, `discount_rules` JSON 스키마 정의 | ✅ |
| 1.3 | 프로젝트 구조 생성 | Backend(FastAPI/Python) + Frontend(React) 구조 | ✅ |
| 1.4 | 타입 정의 | TypeScript/Python 타입 및 Enum 정의 | ✅ |

### Phase 2: 할인 계산 엔진 (Core Engine) ✅ 완료

| # | 작업 | 설명 | 상태 |
|---|------|------|------|
| 2.1 | Eligibility Evaluator | 적용 조건 평가 로직 구현 | ✅ |
| 2.2 | Scope Calculator - UNLOCK | 잠금해제 할인 계산 로직 | ✅ |
| 2.3 | Scope Calculator - RIDE | 탑승 할인 계산 (구간규칙, 환산기준 포함) | ✅ |
| 2.4 | Scope Calculator - ORDER | 주문 할인 계산 로직 | ✅ |
| 2.5 | Cap Rule Applier | 상한 규칙 적용 로직 | ✅ |
| 2.6 | Final Aggregator | 최종 할인 금액 합산 로직 | ✅ |

### Phase 3: Low-code 쿠폰 타입 빌더 (Frontend) ✅ 완료

| # | 작업 | 설명 | 상태 |
|---|------|------|------|
| 3.1 | Eligibility Rule Builder UI | 적용 조건 설정 UI (조건 추가/삭제/연산자 선택) | ✅ |
| 3.2 | Discount Scope Selector | 할인 대상 scope 선택 UI | ✅ |
| 3.3 | Scope Config Panel - UNLOCK | UNLOCK scope 설정 패널 | ✅ |
| 3.4 | Scope Config Panel - RIDE | RIDE scope 설정 패널 (구간규칙 포함) | ✅ |
| 3.5 | Scope Config Panel - ORDER | ORDER scope 설정 패널 | ✅ |
| 3.6 | JSON Preview | 생성된 JSON 규칙 미리보기 | ✅ |
| 3.7 | Coupon Type CRUD | 쿠폰 타입 생성/수정/삭제/조회 | ✅ |

### Phase 4: 시뮬레이터 (Simulator) ✅ 완료

| # | 작업 | 설명 | 상태 |
|---|------|------|------|
| 4.1 | Trip Input Form | 트립 데이터 입력 폼 UI | ✅ |
| 4.2 | Coupon Selector | 쿠폰 선택 UI | ✅ |
| 4.3 | Simulation API | 시뮬레이션 API 엔드포인트 | ✅ |
| 4.4 | Result Visualization | 결과 시각화 (scope별 할인 breakdown) | ✅ |
| 4.5 | Step-by-step Debug View | 계산 과정 단계별 표시 (디버깅용) | ✅ |

### Phase 5: 테스트 및 문서화

| # | 작업 | 설명 | 상태 |
|---|------|------|------|
| 5.1 | Unit Tests | 각 계산 로직 유닛 테스트 | ⬜ |
| 5.2 | Integration Tests | E2E 시뮬레이션 테스트 | ⬜ |
| 5.3 | API 문서화 | OpenAPI/Swagger 문서 생성 | ⬜ |

---

## 🎯 추가 제안

### 1. 수식 표현 방식 ✅ 결정됨

| 방식 | 장점 | 단점 | 선택 |
|------|------|------|------|
| **JSON Rule Engine** | Low-code UI 구현 용이, 유효성 검증 쉬움 | 복잡한 수식 표현 한계 | ✅ **채택** |
| 표현식 언어 (expr-eval) | 유연한 수식 표현 가능 | 보안 이슈, UI 복잡도 증가 | ❌ |
| DSL (Domain Specific Language) | 도메인 특화 표현 가능 | 파서 개발 필요 | ❌ |

### 2. 기술 스택 ✅ 결정됨

```
Backend:  Python + FastAPI + SQLAlchemy (JSON 필드 지원)
Frontend: React + TypeScript + TailwindCSS
Database: MySQL (JSON 타입 활용, 5.7.8+)
UI:       Visual Flow Builder (플로우차트 형태)
```

#### MySQL JSON 기능 참고
```sql
-- JSON 필드 쿼리 예시
SELECT * FROM coupon_type 
WHERE JSON_EXTRACT(discount_rules, '$.scopes[0].scope') = 'UNLOCK';

-- JSON 필드 수정 예시
UPDATE coupon_type 
SET discount_rules = JSON_SET(discount_rules, '$.scopes[0].enabled', false)
WHERE id = 'xxx';
```

### 3. UI/UX 제안 ✅ 결정됨

- **Visual Flow Builder** ✅: 이미지처럼 플로우차트 형태로 규칙을 시각화
- **실시간 미리보기**: 규칙 변경 시 예상 결과 즉시 표시
- **템플릿**: 자주 사용하는 쿠폰 타입 템플릿 제공

---

## 📊 Input/Output 정의

### Input (트립 데이터)
| 필드명 | 설명 | 타입 |
|--------|------|------|
| `unlock_fee` | 잠금해제 비용 | number |
| `ride_fee` | 탑승 이용 금액(전체) | number |
| `pricing_order_amount` | 쿠폰 외 할인이 적용된 주문금액 | number |
| `min_rate` | 분당 요금제의 분당 요금 | number |
| `ride_time` | 탑승 시간(분) | number |
| `lock_time` | 일시잠금 시간(분) | number |
| `ride_distance` | 탑승 거리(km) | number |
| `pass_time` | 시간패스 실제 적용 시간(분) | number |
| `pass_distance` | 거리패스 실제 적용 거리(km) | number |
| `coupon_id` | 쿠폰 ID | string |

### Output (할인 결과)
| 필드명 | 설명 | 타입 |
|--------|------|------|
| `discount_unlock` | 잠금해제 할인 금액 | number |
| `discount_ride` | 탑승 이용 할인 금액 | number |
| `discount_order` | 주문금액 할인 금액 | number |
| `total_discount` | 최종 할인 금액 | number |
| `final_amount` | 최종 결제 금액 | number |

---

## 상태 범례
- ⬜ 미시작
- 🔄 진행중
- ✅ 완료
- ❌ 취소
