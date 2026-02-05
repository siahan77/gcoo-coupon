import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { couponTypesApi, couponsApi } from '@/lib/api'
import type { CouponType, Coupon, ScopeConfig, ScopeValue } from '@/types'
import { DiscountScope, DiscountUnit, CapRuleType, SCOPE_LABELS, DISCOUNT_UNIT_LABELS, CAP_RULE_LABELS } from '@/types'

// scope별 입력값 타입
interface ScopeInputValue {
  discount: number | ''
  cap: number | ''
}

export default function CouponCreatePage() {
  const navigate = useNavigate()
  const [couponTypes, setCouponTypes] = useState<CouponType[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 쿠폰 생성 폼
  const [selectedTypeId, setSelectedTypeId] = useState<string>('')
  const [couponName, setCouponName] = useState('')
  const [couponValues, setCouponValues] = useState<Record<string, ScopeInputValue>>({})
  const [isCreating, setIsCreating] = useState(false)

  // 데이터 로드
  useEffect(() => {
    Promise.all([
      couponTypesApi.list({ is_active: true }),
      couponsApi.list(),
    ]).then(([types, coupons]) => {
      setCouponTypes(types)
      setCoupons(coupons)
      setIsLoading(false)
    })
  }, [])

  const selectedType = couponTypes.find((c) => c.id === selectedTypeId)

  // 활성화된 scope 목록 가져오기
  const getActiveScopes = (): ScopeConfig[] => {
    if (!selectedType?.discount_rules?.scopes) return []
    return selectedType.discount_rules.scopes.filter(s => s.enabled)
  }

  const activeScopes = getActiveScopes()

  // 쿠폰 타입 선택 시 기본값으로 초기화
  useEffect(() => {
    if (selectedTypeId && activeScopes.length > 0) {
      const initialValues: Record<string, ScopeInputValue> = {}
      activeScopes.forEach(scope => {
        initialValues[scope.scope] = {
          discount: scope.default_value ?? '',
          cap: scope.cap_rule?.value ?? '',
        }
      })
      setCouponValues(initialValues)
    } else {
      setCouponValues({})
    }
  }, [selectedTypeId])

  // 쿠폰 생성
  const handleCreate = async () => {
    if (!selectedTypeId) {
      alert('쿠폰 타입을 선택해주세요')
      return
    }
    if (!couponName.trim()) {
      alert('쿠폰 이름을 입력해주세요')
      return
    }

    // value 변환: { "UNLOCK": { discount: 50, cap: 1000 }, ... }
    const valueToSave: Record<string, ScopeValue> = {}
    Object.entries(couponValues).forEach(([key, val]) => {
      const scopeVal: ScopeValue = { discount: 0 }
      
      // discount 값
      if (val.discount !== '' && val.discount !== undefined) {
        scopeVal.discount = Number(val.discount)
      } else {
        // default_value 사용
        const scope = activeScopes.find(s => s.scope === key)
        scopeVal.discount = scope?.default_value ?? 0
      }
      
      // cap 값 (있을 때만)
      if (val.cap !== '' && val.cap !== undefined) {
        scopeVal.cap = Number(val.cap)
      }
      
      valueToSave[key] = scopeVal
    })

    setIsCreating(true)
    try {
      const newCoupon = await couponsApi.create({
        coupon_type_id: selectedTypeId,
        name: couponName,
        value: Object.keys(valueToSave).length > 0 ? valueToSave : undefined,
      })
      setCoupons((prev) => [...prev, newCoupon])
      alert('쿠폰이 생성되었습니다!')
      
      // 폼 초기화
      setCouponName('')
      setSelectedTypeId('')
      setCouponValues({})
    } catch (err) {
      alert('쿠폰 생성에 실패했습니다')
    } finally {
      setIsCreating(false)
    }
  }

  // 쿠폰 삭제
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 쿠폰을 삭제하시겠습니까?`)) return
    
    try {
      await couponsApi.delete(id)
      setCoupons((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      alert('삭제에 실패했습니다')
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
      <h1 className="text-3xl font-bold text-white mb-8">🎫 쿠폰 관리</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left - 쿠폰 생성 */}
        <div className="space-y-6">
          <section className="bg-surface-800 rounded-xl p-6 border border-surface-700">
            <h2 className="text-xl font-semibold text-white mb-6">➕ 새 쿠폰 생성</h2>

            {couponTypes.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-surface-400 mb-4">
                  먼저 쿠폰 타입을 생성해주세요
                </p>
                <button
                  onClick={() => navigate('/builder')}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                >
                  쿠폰 타입 만들기
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 쿠폰 타입 선택 */}
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">
                    1️⃣ 쿠폰 타입 선택
                  </label>
                  <select
                    value={selectedTypeId}
                    onChange={(e) => setSelectedTypeId(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-700 border border-surface-600 rounded-lg text-white"
                  >
                    <option value="">쿠폰 타입을 선택하세요</option>
                    {couponTypes.map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {ct.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedType && (
                  <>
                    {/* 쿠폰 타입 정보 */}
                    <div className="bg-surface-700/50 rounded-lg p-4 text-sm">
                      <div className="text-surface-400 mb-2">선택된 쿠폰 타입:</div>
                      <div className="text-white font-medium">{selectedType.name}</div>
                      {selectedType.description && (
                        <div className="text-surface-400 mt-1">
                          {selectedType.description}
                        </div>
                      )}
                      {activeScopes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {activeScopes.map(scope => (
                            <span
                              key={scope.scope}
                              className="px-2 py-0.5 bg-primary-600/20 text-primary-400 text-xs rounded"
                            >
                              {SCOPE_LABELS[scope.scope]} - {DISCOUNT_UNIT_LABELS[scope.discount_unit]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 쿠폰 이름 */}
                    <div>
                      <label className="block text-sm font-medium text-surface-300 mb-2">
                        2️⃣ 쿠폰 이름
                      </label>
                      <input
                        type="text"
                        value={couponName}
                        onChange={(e) => setCouponName(e.target.value)}
                        className="w-full px-4 py-3 bg-surface-700 border border-surface-600 rounded-lg text-white"
                        placeholder="예: 첫 탑승 100% 할인 쿠폰"
                      />
                    </div>

                    {/* Scope별 Value 입력 */}
                    {activeScopes.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-surface-300 mb-2">
                          3️⃣ 할인 값 설정
                        </label>
                        <div className="space-y-4 bg-surface-700/50 rounded-lg p-4">
                          {activeScopes.map(scope => (
                            <div key={scope.scope} className="border-b border-surface-600 pb-3 last:border-0 last:pb-0">
                              <div className="font-medium text-white mb-2">
                                {SCOPE_LABELS[scope.scope]}
                              </div>
                              
                              {/* 할인 값 */}
                              <div className="mb-2">
                                <label className="flex items-center justify-between text-xs text-surface-400 mb-1">
                                  <span>할인값</span>
                                  <span className="text-surface-500">
                                    {scope.default_value !== undefined && `기본값: ${scope.default_value}`}
                                  </span>
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={couponValues[scope.scope]?.discount ?? ''}
                                    onChange={(e) =>
                                      setCouponValues(prev => ({
                                        ...prev,
                                        [scope.scope]: {
                                          ...prev[scope.scope],
                                          discount: e.target.value === '' ? '' : Number(e.target.value),
                                        },
                                      }))
                                    }
                                    className="flex-1 px-3 py-2 bg-surface-600 border border-surface-500 rounded-lg text-white"
                                    placeholder={
                                      scope.default_value !== undefined
                                        ? `기본값: ${scope.default_value}`
                                        : scope.discount_unit === DiscountUnit.PERCENT
                                        ? '예: 50'
                                        : '예: 1000'
                                    }
                                  />
                                  <span className="text-surface-400 w-8">
                                    {scope.discount_unit === DiscountUnit.PERCENT ? '%' : '원'}
                                  </span>
                                </div>
                              </div>
                              
                              {/* 상한값 (cap_rule이 있을 때만 표시) */}
                              {scope.cap_rule && (
                                <div>
                                  <label className="flex items-center justify-between text-xs text-surface-400 mb-1">
                                    <span>
                                      상한값 ({CAP_RULE_LABELS[scope.cap_rule.type]})
                                    </span>
                                    <span className="text-surface-500">
                                      {scope.cap_rule.value !== undefined && `기본값: ${scope.cap_rule.value}`}
                                    </span>
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={couponValues[scope.scope]?.cap ?? ''}
                                      onChange={(e) =>
                                        setCouponValues(prev => ({
                                          ...prev,
                                          [scope.scope]: {
                                            ...prev[scope.scope],
                                            cap: e.target.value === '' ? '' : Number(e.target.value),
                                          },
                                        }))
                                      }
                                      className="flex-1 px-3 py-2 bg-surface-600 border border-surface-500 rounded-lg text-white"
                                      placeholder={
                                        scope.cap_rule.value !== undefined
                                          ? `기본값: ${scope.cap_rule.value}`
                                          : '예: 500'
                                      }
                                    />
                                    <span className="text-surface-400 w-8">원</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-surface-500 mt-2">
                          비워두면 쿠폰 타입의 기본값이 사용됩니다.
                        </p>
                      </div>
                    )}

                    {activeScopes.length === 0 && (
                      <div className="bg-amber-900/20 border border-amber-600/50 rounded-lg p-4 text-sm text-amber-300">
                        ⚠️ 이 쿠폰 타입에는 활성화된 scope가 없습니다.
                        <br />
                        쿠폰 타입 설정에서 UNLOCK, RIDE, 또는 ORDER를 활성화하세요.
                      </div>
                    )}

                    {/* 생성 버튼 */}
                    <button
                      onClick={handleCreate}
                      disabled={isCreating || activeScopes.length === 0}
                      className="w-full px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-surface-600 text-white font-bold text-lg rounded-xl transition-colors"
                    >
                      {isCreating ? '생성 중...' : '🎫 쿠폰 생성'}
                    </button>
                  </>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Right - 쿠폰 목록 */}
        <div>
          <section className="bg-surface-800 rounded-xl border border-surface-700 overflow-hidden">
            <div className="p-4 border-b border-surface-700">
              <h2 className="text-xl font-semibold text-white">
                📋 생성된 쿠폰 목록 ({coupons.length}개)
              </h2>
            </div>

            {coupons.length === 0 ? (
              <div className="p-8 text-center text-surface-500">
                <div className="text-4xl mb-3">📭</div>
                <p>생성된 쿠폰이 없습니다</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-700 max-h-[600px] overflow-y-auto">
                {coupons.map((coupon) => {
                  const couponType = couponTypes.find(
                    (ct) => ct.id === coupon.coupon_type_id
                  )
                  
                  return (
                    <div
                      key={coupon.id}
                      className="p-4 hover:bg-surface-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-white">
                            {coupon.name || '이름 없음'}
                          </div>
                          <div className="text-sm text-surface-400 mt-1">
                            타입: {couponType?.name || '알 수 없음'}
                          </div>
                          <div className="text-xs text-surface-500 mt-1">
                            ID: {coupon.id.slice(0, 8)}...
                          </div>
                          
                          {/* Value 표시 */}
                          {coupon.value && Object.keys(coupon.value).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Object.entries(coupon.value).map(([scopeKey, val]) => {
                                const scope = couponType?.discount_rules?.scopes?.find(
                                  s => s.scope === scopeKey
                                )
                                const unit = scope?.discount_unit
                                const scopeVal = typeof val === 'object' ? val : { discount: val }
                                return (
                                  <span
                                    key={scopeKey}
                                    className="px-2 py-1 bg-primary-600/20 text-primary-400 text-xs rounded"
                                  >
                                    {scopeKey}: {scopeVal.discount}
                                    {unit === DiscountUnit.PERCENT ? '%' : '원'}
                                    {scopeVal.cap !== undefined && (
                                      <span className="text-surface-400 ml-1">
                                        (상한: {scopeVal.cap}원)
                                      </span>
                                    )}
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/simulator?coupon=${coupon.id}`)}
                            className="px-3 py-1.5 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 text-sm rounded-lg"
                          >
                            시뮬레이션
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(coupon.id, coupon.name || coupon.id)
                            }
                            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
