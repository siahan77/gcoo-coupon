import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'

function ResultNode({}: NodeProps) {
  return (
    <div className="bg-blue-900/80 border-2 border-blue-500 rounded-lg p-4 min-w-[280px] shadow-lg">
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">💰</span>
        <span className="font-bold text-blue-200">최종 할인 계산</span>
      </div>

      <div className="bg-blue-950/50 rounded p-3 text-sm">
        <div className="text-blue-300 mb-2">
          <code className="text-xs">
            total = discount_unlock + discount_ride + discount_order
          </code>
        </div>
        <div className="text-blue-200 text-xs">
          • scope별 할인 상한 적용
          <br />
          • 대상금액 초과 방지
          <br />• 최종 할인금액 → pricing 전달
        </div>
      </div>
    </div>
  )
}

export default memo(ResultNode)
