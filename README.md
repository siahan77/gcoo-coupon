# 🎫 쿠폰 시뮬레이터

쿠폰 타입을 Low-code 방식으로 생성하고, 트립 데이터를 기반으로 할인 금액을 시뮬레이션하는 서비스입니다.

## 📋 목차

- [기능 소개](#-기능-소개)
- [시스템 요구사항](#-시스템-요구사항)
- [설치 및 실행](#-설치-및-실행)
- [프로젝트 구조](#-프로젝트-구조)
- [사용 방법](#-사용-방법)
- [할인 계산 로직](#-할인-계산-로직)
- [데이터 구조](#-데이터-구조)

---

## ✨ 기능 소개

### 1. 쿠폰 타입 빌더 (Low-code)
- **적용 조건 설정**: 탑승 거리, 탑승 시간, 주문 금액 기반 조건
- **할인 범위 설정**: UNLOCK (잠금해제), RIDE (탑승이용), ORDER (주문단위)
- **할인 규칙 설정**: 퍼센트/금액, 구간 규칙(Window), 상한 규칙(Cap) 등

### 2. 쿠폰 생성
- 쿠폰 타입 기반 쿠폰 인스턴스 생성
- Scope별 할인 값 및 상한 값 설정

### 3. 시뮬레이터
- 트립 데이터 입력
- 쿠폰 선택 후 할인 금액 계산
- 상세 계산 과정 확인

---

## 🔧 시스템 요구사항

- **Docker** & **Docker Compose**
- **Node.js** 18+ (프론트엔드)
- **Python** 3.10+ (백엔드)

---

## 🚀 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd coupon_simulator
```

### 2. MySQL 데이터베이스 실행

```bash
docker-compose up -d
```

> MySQL이 `localhost:3306`에서 실행됩니다.
> - Database: `coupon_simulator`
> - User: `coupon_user` / Password: `coupon1234`
> - Root Password: `coupon1234`

### 3. 백엔드 설정 및 실행

```bash
cd backend

# 가상환경 생성 (선택사항)
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정 (기본값 사용 시 생략 가능)
cp env.sample .env

# 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> 백엔드 API: http://localhost:8000
> API 문서 (Swagger): http://localhost:8000/docs

### 4. 프론트엔드 설정 및 실행

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

> 프론트엔드: http://localhost:5173

---

## 📁 프로젝트 구조

```
coupon_simulator/
├── backend/
│   ├── app/
│   │   ├── api/              # API 엔드포인트
│   │   │   ├── coupon_types.py
│   │   │   ├── coupons.py
│   │   │   └── simulation.py
│   │   ├── core/             # 설정 및 DB
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   ├── engine/           # 할인 계산 엔진
│   │   │   ├── calculator.py
│   │   │   ├── eligibility.py
│   │   │   └── simulator.py
│   │   ├── models/           # SQLAlchemy 모델
│   │   │   ├── coupon_type.py
│   │   │   ├── coupon.py
│   │   │   └── enums.py
│   │   ├── schemas/          # Pydantic 스키마
│   │   └── main.py
│   ├── requirements.txt
│   └── env.sample
├── frontend/
│   ├── src/
│   │   ├── components/       # UI 컴포넌트
│   │   ├── pages/            # 페이지
│   │   ├── store/            # Zustand 상태관리
│   │   ├── lib/              # API 클라이언트
│   │   └── types/            # TypeScript 타입
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

---

## 📖 사용 방법

### Step 1: 쿠폰 타입 생성

1. 홈페이지에서 **"새 쿠폰 타입 만들기"** 클릭
2. **적용 조건** 탭: 쿠폰 적용 조건 설정 (예: 탑승시간 10분 이하)
3. **할인 범위** 탭: 할인 대상 Scope 설정
   - `UNLOCK`: 잠금해제 비용 할인
   - `RIDE`: 탑승 이용 금액 할인
   - `ORDER`: 주문 금액 할인 (단독 사용만 가능)
4. **저장** 클릭

### Step 2: 쿠폰 생성

1. 네비게이션에서 **"쿠폰 생성"** 클릭
2. 생성할 쿠폰의 **쿠폰 타입** 선택
3. 각 활성화된 Scope에 대해:
   - **할인 값** 입력 (퍼센트 또는 금액)
   - **상한 값** 입력 (cap_rule이 있는 경우)
4. **쿠폰 생성** 클릭

### Step 3: 시뮬레이션

1. 네비게이션에서 **"시뮬레이터"** 클릭
2. **트립 데이터** 입력
3. **쿠폰 선택**
4. **시뮬레이션 실행** 클릭
5. 결과 확인

---

## 🧮 할인 계산 로직

### 계산 흐름

```
① scope_amount        : 대상 금액 결정 (unlock_fee, ride_fee, pricing_order_amount)
② scope_amount_window : Window 적용 (처음 N분, N분 이후 등)
③ base_amount         : 환산 기준 적용 (NONE, TIME, DISTANCE)
④ calculated_discount : 할인 단위 적용 (PERCENT, AMOUNT)
⑤ final_discount      : 상한 규칙 적용 (SCOPE_DISCOUNT, FINAL_PAYABLE_AMOUNT)
```

### 적용 조건 vs Window

| 구분 | 적용 조건 (Eligibility) | Window (적용 구간) |
|-----|----------------------|-------------------|
| **역할** | 쿠폰 **사용 자격** 판단 | 할인 **적용 범위** 결정 |
| **결과** | 조건 미충족 → **쿠폰 전체 미적용** | 해당 구간 요금에만 할인 |
| **적용 대상** | 쿠폰 전체 (모든 scope) | RIDE scope만 |
| **예시** | "10분 이하 탑승자만 쿠폰 사용 가능" | "처음 10분 요금에만 할인" |

### Window 타입 (RIDE scope 전용)

| 타입 | 설명 | 예시 |
|-----|------|-----|
| `ALL` | 전체 구간 | 전체 탑승 요금에 할인 |
| `FIRST_N` | 처음 N분 | 처음 10분만 할인 |
| `AFTER_N` | N분 이후 | 10분 이후 구간만 할인 |
| `BETWEEN_A_B` | A~B 구간 | 5분~15분 구간만 할인 |

### 상한 규칙 (Cap)

| 타입 | 설명 | 계산 |
|-----|------|-----|
| `SCOPE_DISCOUNT` | 할인 금액 상한 | `min(calculated_discount, cap_value)` |
| `FINAL_PAYABLE_AMOUNT` | 최소 결제 금액 | `max(scope_amount_window - cap_value, 0)` |

> ⚠️ `FINAL_PAYABLE_AMOUNT`는 **Window 적용 구간** 기준으로 계산됩니다.

### 계산 예시

**시나리오**: "처음 10분은 500원만 받고, 나머지는 정상 요금"

**트립 데이터**: ride_time=20분, ride_fee=3,000원 (분당 150원)

```
① scope_amount: 3,000원 (ride_fee)
② window(FIRST_10): 처음 10분 → scope_amount_window: 1,500원
③ base_amount: 1,500원 (axis=NONE)
④ calculated_discount: 1,500 × 100% = 1,500원
⑤ cap(FINAL_PAYABLE_AMOUNT): 구간 내 최소결제 500원 보장
   구간 금액: 1,500원, 최대 할인: 1,500 - 500 = 1,000원
★ final_discount: 1,000원
```

**결과**: 처음 10분 1,000원 할인, 나머지 10분 정상 요금 → **최종 결제 2,000원**

---

## 📊 데이터 구조

### 쿠폰 타입 (coupon_type)

```json
{
  "name": "10분 이하 프로모션",
  "eligibility_rules": {
    "conditions": [
      { "field": "ride_time", "operator": "lte", "value": 10 }
    ],
    "logic": "AND"
  },
  "discount_rules": {
    "scopes": [
      {
        "scope": "UNLOCK",
        "enabled": true,
        "target_field": "unlock_fee",
        "discount_axis": "NONE",
        "discount_unit": "PERCENT",
        "default_value": 50
      },
      {
        "scope": "RIDE",
        "enabled": true,
        "target_field": "ride_fee",
        "discount_axis": "NONE",
        "discount_unit": "PERCENT",
        "default_value": 100,
        "window": { "type": "FIRST_N", "n": 10 },
        "cap_rule": { "type": "FINAL_PAYABLE_AMOUNT", "value": 500 }
      }
    ]
  }
}
```

### 쿠폰 (coupon)

```json
{
  "coupon_type_id": "<쿠폰 타입 ID>",
  "name": "프로모션 쿠폰 A",
  "value": {
    "UNLOCK": { "discount": 50 },
    "RIDE": { "discount": 100, "cap": 500 }
  }
}
```

> 쿠폰 값 구조: `{ "discount": 할인값, "cap": 상한값(선택) }`
> - `discount`: 할인 퍼센트 또는 금액
> - `cap`: 쿠폰별 상한값 (쿠폰 타입의 기본값 오버라이드)

### 트립 입력 (TripInput)

| 필드 | 설명 | 예시 |
|-----|------|-----|
| `unlock_fee` | 잠금해제 비용 | 500원 |
| `ride_fee` | 탑승 이용 금액 | 3,000원 |
| `pricing_order_amount` | 주문 금액 | 3,500원 |
| `min_rate` | 분당 요금 | 150원/분 |
| `ride_time` | 탑승 시간 | 20분 |
| `ride_distance` | 탑승 거리 | 5km |
| `pass_time` | 시간패스 적용 시간 | 0분 |
| `pass_distance` | 거리패스 적용 거리 | 0km |
| `lock_time` | 일시잠금 시간 | 0분 |

---

## 🗃️ API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/coupon-types` | 쿠폰 타입 목록 조회 |
| POST | `/api/coupon-types` | 쿠폰 타입 생성 |
| GET | `/api/coupon-types/{id}` | 쿠폰 타입 상세 조회 |
| PUT | `/api/coupon-types/{id}` | 쿠폰 타입 수정 |
| DELETE | `/api/coupon-types/{id}` | 쿠폰 타입 삭제 |
| GET | `/api/coupons` | 쿠폰 목록 조회 |
| POST | `/api/coupons` | 쿠폰 생성 |
| DELETE | `/api/coupons/{id}` | 쿠폰 삭제 |
| POST | `/api/simulation` | 시뮬레이션 실행 |

> 전체 API 문서: http://localhost:8000/docs

---

## ⚠️ 주의사항

### Scope 조합 규칙
- **UNLOCK + RIDE**: 함께 사용 가능
- **ORDER**: 단독 사용만 가능 (UNLOCK/RIDE와 함께 사용 불가)

### 할인 환산 기준 (discount_axis)
| 타입 | 설명 | 사용 |
|-----|------|-----|
| `NONE` | 전체 금액 기준 | 기본값 |
| `TIME` | 시간 기준 | `pass_time × min_rate` |
| `DISTANCE` | 거리 기준 | `pass_distance / ride_distance` 비율 |

---

## 🛠️ 개발 환경

### 백엔드
- FastAPI
- SQLAlchemy
- PyMySQL
- Pydantic

### 프론트엔드
- React 18 + TypeScript
- Vite
- TailwindCSS
- Zustand (상태관리)

---

## 📝 라이센스

Private - GBIKE Internal Use Only
