import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import type { EligibilityRules } from '@/types'
import { FIELD_LABELS, OPERATOR_LABELS } from '@/types'

interface EligibilityNodeData {
  rules: EligibilityRules
}

function EligibilityNode({ data }: NodeProps) {
  const nodeData = data as EligibilityNodeData
  const { rules } = nodeData

  return (
    <div className="bg-amber-900/80 border-2 border-amber-500 rounded-lg p-4 min-w-[280px] shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🎯</span>
        <span className="font-bold text-amber-200">적용 조건 확인</span>
      </div>

      {rules.conditions.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs text-amber-300 mb-2">
            논리: {rules.logic === 'AND' ? '모두 충족' : '하나라도 충족'}
          </div>
          {rules.conditions.map((condition, index) => (
            <div
              key={index}
              className="bg-amber-950/50 rounded px-2 py-1 text-xs text-amber-100"
            >
              {FIELD_LABELS[condition.field]} {OPERATOR_LABELS[condition.operator]}{' '}
              {condition.value}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-amber-300/70">조건 없음 (무조건 적용)</div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-amber-500" />
    </div>
  )
}

export default memo(EligibilityNode)
