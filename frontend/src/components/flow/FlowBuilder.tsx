import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useCouponTypeStore } from '@/store/couponTypeStore'
import { DiscountScope } from '@/types'
import EligibilityNode from './nodes/EligibilityNode'
import ScopeNode from './nodes/ScopeNode'
import ResultNode from './nodes/ResultNode'

// 커스텀 노드 타입
const nodeTypes = {
  eligibility: EligibilityNode,
  scope: ScopeNode,
  result: ResultNode,
}

export default function FlowBuilder() {
  const { eligibilityRules, discountRules } = useCouponTypeStore()

  // 노드 생성
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [
      // 적용 조건 노드
      {
        id: 'eligibility',
        type: 'eligibility',
        position: { x: 400, y: 50 },
        data: { rules: eligibilityRules },
        sourcePosition: Position.Bottom,
      },
      // Scope 분기 노드들
      {
        id: 'scope-unlock',
        type: 'scope',
        position: { x: 100, y: 250 },
        data: {
          scope: DiscountScope.UNLOCK,
          config: discountRules.scopes.find((s) => s.scope === DiscountScope.UNLOCK),
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      },
      {
        id: 'scope-ride',
        type: 'scope',
        position: { x: 400, y: 250 },
        data: {
          scope: DiscountScope.RIDE,
          config: discountRules.scopes.find((s) => s.scope === DiscountScope.RIDE),
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      },
      {
        id: 'scope-order',
        type: 'scope',
        position: { x: 700, y: 250 },
        data: {
          scope: DiscountScope.ORDER,
          config: discountRules.scopes.find((s) => s.scope === DiscountScope.ORDER),
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      },
      // 결과 노드
      {
        id: 'result',
        type: 'result',
        position: { x: 400, y: 500 },
        data: {},
        targetPosition: Position.Top,
      },
    ]
    return nodes
  }, [eligibilityRules, discountRules])

  // 엣지 생성
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [
      // 적용 조건 → 각 Scope
      {
        id: 'e-elig-unlock',
        source: 'eligibility',
        target: 'scope-unlock',
        animated: true,
        style: { stroke: '#22c55e' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
      },
      {
        id: 'e-elig-ride',
        source: 'eligibility',
        target: 'scope-ride',
        animated: true,
        style: { stroke: '#22c55e' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
      },
      {
        id: 'e-elig-order',
        source: 'eligibility',
        target: 'scope-order',
        animated: true,
        style: { stroke: '#22c55e' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
      },
      // 각 Scope → 결과
      {
        id: 'e-unlock-result',
        source: 'scope-unlock',
        target: 'result',
        style: { stroke: '#3b82f6' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      },
      {
        id: 'e-ride-result',
        source: 'scope-ride',
        target: 'result',
        style: { stroke: '#3b82f6' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      },
      {
        id: 'e-order-result',
        source: 'scope-order',
        target: 'result',
        style: { stroke: '#3b82f6' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      },
    ]
    return edges
  }, [])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div className="w-full h-[600px] bg-surface-900 rounded-xl border border-surface-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#334155" gap={20} />
        <Controls className="bg-surface-800 border-surface-600" />
        <MiniMap
          className="bg-surface-800"
          nodeColor={(node) => {
            if (node.type === 'eligibility') return '#f59e0b'
            if (node.type === 'scope') return '#22c55e'
            return '#3b82f6'
          }}
        />
      </ReactFlow>
    </div>
  )
}
