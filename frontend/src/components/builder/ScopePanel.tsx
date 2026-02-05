import { useCouponTypeStore } from '@/store/couponTypeStore'
import {
  DiscountScope,
  DiscountAxis,
  DiscountUnit,
  WindowType,
  CapRuleType,
  SCOPE_LABELS,
  DISCOUNT_AXIS_LABELS,
  DISCOUNT_UNIT_LABELS,
  WINDOW_TYPE_LABELS,
  CAP_RULE_LABELS,
} from '@/types'

interface ScopePanelProps {
  scope: DiscountScope
}

const scopeDescriptions: Record<DiscountScope, string> = {
  [DiscountScope.UNLOCK]: '잠금해제 비용(unlock_fee)에 대한 할인을 설정합니다.',
  [DiscountScope.RIDE]: '탑승 이용 금액(ride_fee)에 대한 할인을 설정합니다.',
  [DiscountScope.ORDER]: '주문 금액(pricing_order_amount)에 대한 할인을 설정합니다. ⚠️ ORDER는 단독 사용만 가능합니다.',
}

const targetFields: Record<DiscountScope, string> = {
  [DiscountScope.UNLOCK]: 'unlock_fee',
  [DiscountScope.RIDE]: 'ride_fee',
  [DiscountScope.ORDER]: 'pricing_order_amount',
}

export default function ScopePanel({ scope }: ScopePanelProps) {
  const { discountRules, updateScope } = useCouponTypeStore()
  const config = discountRules.scopes.find((s) => s.scope === scope)

  if (!config) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">{SCOPE_LABELS[scope]} 설정</h3>
          <p className="text-surface-400 text-sm mt-1">{scopeDescriptions[scope]}</p>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="text-surface-300">활성화</span>
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => updateScope(scope, { enabled: e.target.checked })}
            className="w-6 h-6 rounded border-surface-500 text-primary-600 focus:ring-primary-500"
          />
        </label>
      </div>

      {/* ORDER 단독 사용 안내 */}
      {scope === DiscountScope.ORDER && (
        <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-3 text-sm text-amber-300">
          ⚠️ ORDER는 UNLOCK/RIDE와 함께 사용할 수 없습니다.
          <br />
          ORDER를 활성화하면 UNLOCK/RIDE가 자동으로 비활성화됩니다.
        </div>
      )}

      {!config.enabled && (
        <div className="bg-surface-700/50 rounded-lg p-8 text-center text-surface-500">
          <div className="text-4xl mb-2">💤</div>
          <p>이 scope는 비활성화되어 있습니다.</p>
          <p className="text-sm">활성화하면 할인 규칙을 설정할 수 있습니다.</p>
        </div>
      )}

      {config.enabled && (
        <div className="space-y-4">
          {/* 대상 필드 */}
          <div className="bg-surface-700 rounded-lg p-4">
            <label className="block text-sm font-medium text-surface-300 mb-2">
              할인 대상 필드
            </label>
            <div className="px-4 py-2 bg-surface-600 rounded-lg text-white font-mono">
              {targetFields[scope]}
            </div>
          </div>

          {/* RIDE 전용: 적용 구간 (window) */}
          {scope === DiscountScope.RIDE && (
            <div className="bg-surface-700 rounded-lg p-4">
              <label className="block text-sm font-medium text-surface-300 mb-2">
                적용 구간 (window)
              </label>
              <select
                value={config.window?.type || WindowType.ALL}
                onChange={(e) =>
                  updateScope(scope, {
                    window: {
                      type: e.target.value as WindowType,
                      n: config.window?.n,
                      a: config.window?.a,
                      b: config.window?.b,
                    },
                  })
                }
                className="w-full px-4 py-2 bg-surface-600 border border-surface-500 rounded-lg text-white"
              >
                {Object.entries(WINDOW_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              {/* FIRST_N, AFTER_N의 N 값 */}
              {(config.window?.type === WindowType.FIRST_N ||
                config.window?.type === WindowType.AFTER_N) && (
                <div className="mt-3">
                  <label className="block text-xs text-surface-400 mb-1">
                    N 값 (분)
                  </label>
                  <input
                    type="number"
                    value={config.window?.n || 0}
                    onChange={(e) =>
                      updateScope(scope, {
                        window: {
                          ...config.window!,
                          n: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-surface-600 border border-surface-500 rounded-lg text-white"
                    placeholder="예: 10 (처음 10분)"
                  />
                </div>
              )}

              {/* BETWEEN_A_B의 A, B 값 */}
              {config.window?.type === WindowType.BETWEEN_A_B && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs text-surface-400 mb-1">
                      A 값 (시작, 분)
                    </label>
                    <input
                      type="number"
                      value={config.window?.a || 0}
                      onChange={(e) =>
                        updateScope(scope, {
                          window: {
                            ...config.window!,
                            a: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-surface-600 border border-surface-500 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-surface-400 mb-1">
                      B 값 (끝, 분)
                    </label>
                    <input
                      type="number"
                      value={config.window?.b || 0}
                      onChange={(e) =>
                        updateScope(scope, {
                          window: {
                            ...config.window!,
                            b: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-surface-600 border border-surface-500 rounded-lg text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 환산 기준 (discount_axis) - 패스용 */}
          {scope === DiscountScope.RIDE && (
            <div className="bg-surface-700 rounded-lg p-4">
              <label className="block text-sm font-medium text-surface-300 mb-2">
                환산 기준 (패스 적용)
              </label>
              <select
                value={config.discount_axis}
                onChange={(e) =>
                  updateScope(scope, {
                    discount_axis: e.target.value as DiscountAxis,
                  })
                }
                className="w-full px-4 py-2 bg-surface-600 border border-surface-500 rounded-lg text-white"
              >
                {Object.entries(DISCOUNT_AXIS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-surface-500 mt-2">
                TIME: pass_time × min_rate 기준, DISTANCE: pass_distance / ride_distance 비율
              </p>
            </div>
          )}

          {/* 할인 단위 */}
          <div className="bg-surface-700 rounded-lg p-4">
            <label className="block text-sm font-medium text-surface-300 mb-2">
              할인 단위
            </label>
            <select
              value={config.discount_unit}
              onChange={(e) =>
                updateScope(scope, {
                  discount_unit: e.target.value as DiscountUnit,
                })
              }
              className="w-full px-4 py-2 bg-surface-600 border border-surface-500 rounded-lg text-white"
            >
              {Object.entries(DISCOUNT_UNIT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 기본 할인 값 (default_value) */}
          {config.discount_unit !== DiscountUnit.NONE && (
            <div className="bg-surface-700 rounded-lg p-4">
              <label className="block text-sm font-medium text-surface-300 mb-2">
                기본 할인 값 (선택사항)
              </label>
              <input
                type="number"
                value={config.default_value || ''}
                onChange={(e) =>
                  updateScope(scope, {
                    default_value: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-4 py-2 bg-surface-600 border border-surface-500 rounded-lg text-white"
                placeholder={
                  config.discount_unit === DiscountUnit.PERCENT
                    ? '예: 50 (50%)'
                    : '예: 1000 (1000원)'
                }
              />
              <p className="text-xs text-surface-500 mt-2">
                쿠폰 생성 시 값을 지정하지 않으면 이 기본값이 사용됩니다.
              </p>
            </div>
          )}

          {/* 상한 규칙 */}
          <div className="bg-surface-700 rounded-lg p-4">
            <label className="block text-sm font-medium text-surface-300 mb-2">
              상한 규칙
            </label>
            <select
              value={config.cap_rule?.type || ''}
              onChange={(e) =>
                updateScope(scope, {
                  cap_rule: e.target.value
                    ? {
                        type: e.target.value as CapRuleType,
                        value: config.cap_rule?.value,
                      }
                    : undefined,
                })
              }
              className="w-full px-4 py-2 bg-surface-600 border border-surface-500 rounded-lg text-white"
            >
              <option value="">없음</option>
              {Object.entries(CAP_RULE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {config.cap_rule && (
              <div className="mt-3">
                <label className="block text-xs text-surface-400 mb-1">
                  {config.cap_rule.type === CapRuleType.SCOPE_DISCOUNT
                    ? '최대 할인 금액 (원)'
                    : '최소 결제 금액 (원)'}
                </label>
                <input
                  type="number"
                  value={config.cap_rule.value || ''}
                  onChange={(e) =>
                    updateScope(scope, {
                      cap_rule: {
                        ...config.cap_rule!,
                        value: e.target.value ? Number(e.target.value) : undefined,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-600 border border-surface-500 rounded-lg text-white"
                  placeholder={
                    config.cap_rule.type === CapRuleType.SCOPE_DISCOUNT
                      ? '예: 500 (최대 500원 할인)'
                      : '예: 1000 (최소 1000원 결제)'
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
