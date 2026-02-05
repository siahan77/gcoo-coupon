import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { couponTypesApi, couponsApi, simulationApi } from '@/lib/api'
import type {
  TripInput,
  SimulationResult,
  CouponType,
  Coupon,
} from '@/types'

const initialTripInput: TripInput = {
  unlock_fee: 500,
  ride_fee: 3000,
  pricing_order_amount: 3500,
  min_rate: 150,
  ride_time: 20,
  lock_time: 0,
  ride_distance: 5.0,
  pass_time: 0,
  pass_distance: 0,
}

const tripInputFields: {
  key: keyof TripInput
  label: string
  unit: string
  step?: number
}[] = [
  { key: 'unlock_fee', label: '잠금해제 비용', unit: '원' },
  { key: 'ride_fee', label: '탑승 이용 금액', unit: '원' },
  { key: 'pricing_order_amount', label: '주문 금액', unit: '원' },
  { key: 'min_rate', label: '분당 요금', unit: '원/분' },
  { key: 'ride_time', label: '탑승 시간', unit: '분' },
  { key: 'lock_time', label: '일시잠금 시간', unit: '분' },
  { key: 'ride_distance', label: '탑승 거리', unit: 'km', step: 0.1 },
  { key: 'pass_time', label: '시간패스 적용', unit: '분' },
  { key: 'pass_distance', label: '거리패스 적용', unit: 'km', step: 0.1 },
]

export default function SimulatorPage() {
  const [searchParams] = useSearchParams()
  const [tripInput, setTripInput] = useState<TripInput>(initialTripInput)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 쿠폰 타입 및 쿠폰 목록
  const [couponTypes, setCouponTypes] = useState<CouponType[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [selectedCouponId, setSelectedCouponId] = useState<string>('')

  // 데이터 로드
  useEffect(() => {
    Promise.all([
      couponTypesApi.list({ is_active: true }),
      couponsApi.list(),
    ]).then(([types, allCoupons]) => {
      setCouponTypes(types)
      setCoupons(allCoupons)
      setIsLoading(false)

      // URL 파라미터로 쿠폰 ID가 전달된 경우
      const couponIdFromUrl = searchParams.get('coupon')
      if (couponIdFromUrl && allCoupons.find((c) => c.id === couponIdFromUrl)) {
        setSelectedCouponId(couponIdFromUrl)
      }
    })
  }, [searchParams])

  const handleInputChange = (key: keyof TripInput, value: number) => {
    setTripInput((prev) => ({ ...prev, [key]: value }))
  }

  // 선택된 쿠폰의 타입 찾기
  const selectedCoupon = coupons.find((c) => c.id === selectedCouponId)
  const selectedCouponType = selectedCoupon
    ? couponTypes.find((ct) => ct.id === selectedCoupon.coupon_type_id)
    : null

  // 시뮬레이션
  const handleSimulate = async () => {
    if (!selectedCouponId) {
      alert('쿠폰을 선택해주세요')
      return
    }

    setIsSimulating(true)
    setError(null)

    try {
      const res = await simulationApi.simulate({
        coupon_id: selectedCouponId,
        trip: tripInput,
      })
      setResult(res)
    } catch (err: any) {
      setError(err.response?.data?.detail || '시뮬레이션에 실패했습니다')
    } finally {
      setIsSimulating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-surface-400">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">🧪 시뮬레이터</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Input */}
        <div className="space-y-6">
          {/* Trip Input */}
          <section className="bg-surface-800 rounded-xl p-6 border border-surface-700">
            <h2 className="text-xl font-semibold text-white mb-4">📊 트립 데이터</h2>
            <div className="grid grid-cols-2 gap-4">
              {tripInputFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-surface-300 mb-1">
                    {field.label}
                    <span className="text-surface-500 ml-1">({field.unit})</span>
                  </label>
                  <input
                    type="number"
                    value={tripInput[field.key]}
                    onChange={(e) =>
                      handleInputChange(field.key, Number(e.target.value))
                    }
                    step={field.step || 1}
                    className="w-full px-4 py-2 bg-surface-700 border border-surface-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Coupon Selection */}
          <section className="bg-surface-800 rounded-xl p-6 border border-surface-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">🎫 쿠폰 선택</h2>
              <Link
                to="/coupons"
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                쿠폰 관리 →
              </Link>
            </div>

            {coupons.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-surface-400 mb-4">
                  생성된 쿠폰이 없습니다
                </p>
                <Link
                  to="/coupons"
                  className="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                >
                  쿠폰 만들러 가기
                </Link>
              </div>
            ) : (
              <>
                {/* 쿠폰 선택 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    시뮬레이션 할 쿠폰
                  </label>
                  <select
                    value={selectedCouponId}
                    onChange={(e) => setSelectedCouponId(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-700 border border-surface-600 rounded-lg text-white"
                  >
                    <option value="">쿠폰을 선택하세요</option>
                    {coupons.map((c) => {
                      const ct = couponTypes.find((t) => t.id === c.coupon_type_id)
                      return (
                        <option key={c.id} value={c.id}>
                          {c.name || c.id.slice(0, 8)} ({ct?.name || '알 수 없음'})
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* 선택된 쿠폰 정보 */}
                {selectedCoupon && selectedCouponType && (
                  <div className="bg-surface-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-white">
                        {selectedCoupon.name}
                      </span>
                      <span className="px-2 py-0.5 bg-surface-600 text-surface-400 text-xs rounded">
                        {selectedCouponType.name}
                      </span>
                    </div>
                    {selectedCoupon.value && Object.keys(selectedCoupon.value).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedCoupon.value).map(([scopeKey, val]) => {
                          // val이 객체인 경우 (새 구조) vs 숫자인 경우 (하위 호환)
                          const scopeVal = typeof val === 'object' ? val : { discount: val }
                          return (
                            <span
                              key={scopeKey}
                              className="px-2 py-1 bg-primary-600/20 text-primary-400 text-xs rounded"
                            >
                              {scopeKey}: {scopeVal.discount}
                              {scopeVal.cap !== undefined && (
                                <span className="text-surface-400 ml-1">(상한: {scopeVal.cap})</span>
                              )}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>

          {/* Simulate Button */}
          <button
            onClick={handleSimulate}
            disabled={!selectedCouponId || isSimulating}
            className="w-full px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-surface-600 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-colors shadow-lg shadow-primary-600/20"
          >
            {isSimulating ? '계산 중...' : '🚀 시뮬레이션 실행'}
          </button>

          {error && (
            <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Right Panel - Result */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Summary */}
              <section className="bg-surface-800 rounded-xl p-6 border border-surface-700">
                <h2 className="text-xl font-semibold text-white mb-4">📈 결과 요약</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface-700 rounded-lg p-4">
                    <div className="text-surface-400 text-sm">원본 금액</div>
                    <div className="text-2xl font-bold text-white">
                      {result.original_amount.toLocaleString()}원
                    </div>
                  </div>
                  <div className="bg-primary-900/30 border border-primary-500/30 rounded-lg p-4">
                    <div className="text-primary-400 text-sm">총 할인</div>
                    <div className="text-2xl font-bold text-primary-400">
                      -{result.total_discount.toLocaleString()}원
                    </div>
                  </div>
                </div>

                <div className="bg-surface-900 rounded-lg p-6 text-center">
                  <div className="text-surface-400 text-sm mb-1">최종 결제 금액</div>
                  <div className="text-4xl font-bold text-white">
                    {result.final_amount.toLocaleString()}원
                  </div>
                </div>
              </section>

              {/* Breakdown */}
              <section className="bg-surface-800 rounded-xl p-6 border border-surface-700">
                <h2 className="text-xl font-semibold text-white mb-4">📋 할인 상세</h2>

                <div className="space-y-4">
                  {result.breakdown.unlock?.enabled && (
                    <ScopeResultCard
                      icon="🔓"
                      label="UNLOCK"
                      result={result.breakdown.unlock}
                    />
                  )}
                  {result.breakdown.ride?.enabled && (
                    <ScopeResultCard
                      icon="🛵"
                      label="RIDE"
                      result={result.breakdown.ride}
                    />
                  )}
                  {result.breakdown.order?.enabled && (
                    <ScopeResultCard
                      icon="📦"
                      label="ORDER"
                      result={result.breakdown.order}
                    />
                  )}
                </div>
              </section>

              {/* Eligibility */}
              <section className="bg-surface-800 rounded-xl p-6 border border-surface-700">
                <h2 className="text-xl font-semibold text-white mb-4">
                  ✅ 적용 조건{' '}
                  <span
                    className={
                      result.eligibility_met ? 'text-green-400' : 'text-red-400'
                    }
                  >
                    ({result.eligibility_met ? '충족' : '미충족'})
                  </span>
                </h2>

                <div className="space-y-1 text-sm text-surface-400">
                  {result.eligibility_details.map((detail, i) => (
                    <div key={i}>{detail}</div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="bg-surface-800 rounded-xl p-12 border border-surface-700 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                시뮬레이션 대기 중
              </h3>
              <p className="text-surface-400">
                트립 데이터를 입력하고 쿠폰을 선택한 후
                <br />
                시뮬레이션을 실행하세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Scope Result Card Component
function ScopeResultCard({
  icon,
  label,
  result,
}: {
  icon: string
  label: string
  result: SimulationResult['breakdown']['unlock']
}) {
  if (!result) return null

  return (
    <div className="bg-surface-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-white">
          {icon} {label}
        </span>
        <span className="text-primary-400 font-bold">
          -{result.final_discount.toLocaleString()}원
        </span>
      </div>
      <div className="space-y-1 text-sm text-surface-400">
        {result.calculation_steps.map((step, i) => (
          <div key={i} className="font-mono text-xs">
            {step}
          </div>
        ))}
      </div>
    </div>
  )
}
