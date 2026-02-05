import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import type { ScopeConfig } from '@/types'
import {
  DiscountScope,
  SCOPE_LABELS,
  DISCOUNT_UNIT_LABELS,
  DISCOUNT_AXIS_LABELS,
  WINDOW_TYPE_LABELS,
} from '@/types'

interface ScopeNodeData {
  scope: DiscountScope
  config?: ScopeConfig
}

const scopeIcons: Record<DiscountScope, string> = {
  [DiscountScope.UNLOCK]: '🔓',
  [DiscountScope.RIDE]: '🛵',
  [DiscountScope.ORDER]: '📦',
}

const scopeColors: Record<DiscountScope, { bg: string; border: string; text: string }> = {
  [DiscountScope.UNLOCK]: {
    bg: 'bg-emerald-900/80',
    border: 'border-emerald-500',
    text: 'text-emerald-200',
  },
  [DiscountScope.RIDE]: {
    bg: 'bg-sky-900/80',
    border: 'border-sky-500',
    text: 'text-sky-200',
  },
  [DiscountScope.ORDER]: {
    bg: 'bg-violet-900/80',
    border: 'border-violet-500',
    text: 'text-violet-200',
  },
}

function ScopeNode({ data }: NodeProps) {
  const nodeData = data as ScopeNodeData
  const { scope, config } = nodeData
  const colors = scopeColors[scope]
  const isEnabled = config?.enabled ?? false

  return (
    <div
      className={`${colors.bg} border-2 ${colors.border} rounded-lg p-4 min-w-[220px] shadow-lg ${
        !isEnabled ? 'opacity-50' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-surface-400" />

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{scopeIcons[scope]}</span>
        <span className={`font-bold ${colors.text}`}>{SCOPE_LABELS[scope]}</span>
        {!isEnabled && (
          <span className="ml-auto text-xs bg-surface-700 px-2 py-0.5 rounded text-surface-400">
            비활성
          </span>
        )}
      </div>

      {isEnabled && config && (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-surface-400">대상:</span>
            <span className={colors.text}>{config.target_field}</span>
          </div>

          {scope === DiscountScope.RIDE && config.window && (
            <div className="flex justify-between">
              <span className="text-surface-400">구간:</span>
              <span className={colors.text}>
                {WINDOW_TYPE_LABELS[config.window.type]}
                {config.window.n !== undefined && ` (${config.window.n})`}
              </span>
            </div>
          )}

          {scope === DiscountScope.RIDE && (
            <div className="flex justify-between">
              <span className="text-surface-400">환산:</span>
              <span className={colors.text}>
                {DISCOUNT_AXIS_LABELS[config.discount_axis]}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-surface-400">단위:</span>
            <span className={colors.text}>
              {DISCOUNT_UNIT_LABELS[config.discount_unit]}
            </span>
          </div>

          {config.default_value !== undefined && (
            <div className="flex justify-between">
              <span className="text-surface-400">기본값:</span>
              <span className={colors.text}>{config.default_value}</span>
            </div>
          )}

          {config.cap_rule && (
            <div className="mt-2 pt-2 border-t border-surface-600">
              <div className="text-surface-400">
                상한: {config.cap_rule.value !== undefined ? `${config.cap_rule.value}원` : '설정됨'}
              </div>
            </div>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-surface-400" />
    </div>
  )
}

export default memo(ScopeNode)
