import { useCouponTypeStore } from '@/store/couponTypeStore'
import {
  ConditionField,
  ConditionOperator,
  ConditionLogic,
  FIELD_LABELS,
  OPERATOR_LABELS,
} from '@/types'

export default function EligibilityPanel() {
  const {
    eligibilityRules,
    setEligibilityLogic,
    addCondition,
    updateCondition,
    removeCondition,
  } = useCouponTypeStore()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">🎯 적용 조건 설정</h3>
        <button
          onClick={addCondition}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
        >
          + 조건 추가
        </button>
      </div>

      <p className="text-surface-400 text-sm">
        쿠폰이 적용될 조건을 설정합니다. 조건이 없으면 무조건 적용됩니다.
      </p>

      {/* 논리 연산자 */}
      {eligibilityRules.conditions.length > 1 && (
        <div className="bg-surface-700 rounded-lg p-4">
          <label className="block text-sm font-medium text-surface-300 mb-2">
            조건 논리
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="logic"
                checked={eligibilityRules.logic === ConditionLogic.AND}
                onChange={() => setEligibilityLogic(ConditionLogic.AND)}
                className="text-primary-600"
              />
              <span className="text-white">AND (모두 충족)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="logic"
                checked={eligibilityRules.logic === ConditionLogic.OR}
                onChange={() => setEligibilityLogic(ConditionLogic.OR)}
                className="text-primary-600"
              />
              <span className="text-white">OR (하나라도 충족)</span>
            </label>
          </div>
        </div>
      )}

      {/* 조건 목록 */}
      <div className="space-y-3">
        {eligibilityRules.conditions.map((condition, index) => (
          <div
            key={index}
            className="bg-surface-700 rounded-lg p-4 border border-surface-600"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs text-surface-400 mb-1">필드</label>
                <select
                  value={condition.field}
                  onChange={(e) =>
                    updateCondition(index, {
                      field: e.target.value as ConditionField,
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-600 border border-surface-500 rounded-lg text-white"
                >
                  {Object.entries(FIELD_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-32">
                <label className="block text-xs text-surface-400 mb-1">연산자</label>
                <select
                  value={condition.operator}
                  onChange={(e) =>
                    updateCondition(index, {
                      operator: e.target.value as ConditionOperator,
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-600 border border-surface-500 rounded-lg text-white"
                >
                  {Object.entries(OPERATOR_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-32">
                <label className="block text-xs text-surface-400 mb-1">값</label>
                <input
                  type="number"
                  value={condition.value}
                  onChange={(e) =>
                    updateCondition(index, { value: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-surface-600 border border-surface-500 rounded-lg text-white"
                />
              </div>

              <button
                onClick={() => removeCondition(index)}
                className="mt-5 p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                title="삭제"
              >
                🗑️
              </button>
            </div>

            {/* 조건 미리보기 */}
            <div className="mt-3 text-sm text-surface-400">
              미리보기:{' '}
              <span className="text-primary-400">
                {FIELD_LABELS[condition.field]} {OPERATOR_LABELS[condition.operator]}{' '}
                {condition.value}
              </span>
            </div>
          </div>
        ))}

        {eligibilityRules.conditions.length === 0 && (
          <div className="text-center py-8 text-surface-500">
            <div className="text-4xl mb-2">📋</div>
            <p>조건이 없습니다.</p>
            <p className="text-sm">조건을 추가하거나, 조건 없이 무조건 적용됩니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
