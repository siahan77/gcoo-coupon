import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCouponTypeStore } from '@/store/couponTypeStore'
import FlowBuilder from '@/components/flow/FlowBuilder'
import EligibilityPanel from '@/components/builder/EligibilityPanel'
import ScopePanel from '@/components/builder/ScopePanel'
import { DiscountScope } from '@/types'

type TabType = 'flow' | 'eligibility' | 'unlock' | 'ride' | 'order' | 'json'

export default function CouponTypeBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('flow')
  const [isSaving, setIsSaving] = useState(false)

  const {
    name,
    description,
    editingId,
    isLoading,
    error,
    couponTypes,
    setName,
    setDescription,
    loadCouponType,
    saveCouponType,
    resetForm,
    generateJSON,
    fetchCouponTypes,
  } = useCouponTypeStore()

  // 쿠폰 타입 목록 로드
  useEffect(() => {
    fetchCouponTypes()
  }, [])

  // ID가 있으면 로드
  useEffect(() => {
    if (id) {
      loadCouponType(id)
    } else {
      resetForm()
    }
  }, [id])

  // 쿠폰 타입 선택 핸들러
  const handleSelectCouponType = (selectedId: string) => {
    if (selectedId === '') {
      resetForm()
      navigate('/builder')
    } else {
      navigate(`/builder/${selectedId}`)
    }
  }

  // 저장
  const handleSave = async () => {
    if (!name.trim()) {
      alert('쿠폰 타입 이름을 입력해주세요')
      return
    }

    setIsSaving(true)
    try {
      const saved = await saveCouponType()
      alert(editingId ? '수정되었습니다' : '생성되었습니다')
      if (!editingId) {
        navigate(`/builder/${saved.id}`)
      }
    } catch (err) {
      alert('저장에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'flow', label: 'Flow', icon: '🔀' },
    { id: 'eligibility', label: '적용 조건', icon: '🎯' },
    { id: 'unlock', label: 'UNLOCK', icon: '🔓' },
    { id: 'ride', label: 'RIDE', icon: '🛵' },
    { id: 'order', label: 'ORDER', icon: '📦' },
    { id: 'json', label: 'JSON', icon: '📄' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-surface-400">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            🔧 {editingId ? '쿠폰타입 수정' : '쿠폰타입 생성'}
          </h1>
          {editingId && (
            <p className="text-surface-400 text-sm mt-1">ID: {editingId}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* 기존 쿠폰타입 선택 드롭다운 */}
          <select
            value={editingId || ''}
            onChange={(e) => handleSelectCouponType(e.target.value)}
            className="px-4 py-2 bg-surface-700 border border-surface-600 rounded-lg text-white focus:outline-none focus:border-primary-500 min-w-[200px]"
          >
            <option value="">✨ 새로 만들기</option>
            {couponTypes.map((ct) => (
              <option key={ct.id} value={ct.id}>
                📋 {ct.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-surface-700 hover:bg-surface-600 text-white rounded-lg transition-colors"
          >
            홈으로
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '💾 저장'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* 기본 정보 */}
      <div className="bg-surface-800 rounded-xl p-6 border border-surface-700 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">📝 기본 정보</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1">
              쿠폰타입 이름 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-surface-700 border border-surface-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              placeholder="예: 첫 탑승 할인"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1">
              설명
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-surface-700 border border-surface-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              placeholder="쿠폰타입에 대한 설명"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-surface-800 p-1 rounded-lg border border-surface-700 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'text-surface-400 hover:text-white hover:bg-surface-700'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-surface-800 rounded-xl border border-surface-700 overflow-hidden">
        {activeTab === 'flow' && (
          <div className="p-4">
            <FlowBuilder />
          </div>
        )}

        {activeTab === 'eligibility' && (
          <div className="p-6">
            <EligibilityPanel />
          </div>
        )}

        {activeTab === 'unlock' && (
          <div className="p-6">
            <ScopePanel scope={DiscountScope.UNLOCK} />
          </div>
        )}

        {activeTab === 'ride' && (
          <div className="p-6">
            <ScopePanel scope={DiscountScope.RIDE} />
          </div>
        )}

        {activeTab === 'order' && (
          <div className="p-6">
            <ScopePanel scope={DiscountScope.ORDER} />
          </div>
        )}

        {activeTab === 'json' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              📄 JSON 미리보기
            </h3>
            <pre className="bg-surface-900 p-4 rounded-lg overflow-auto max-h-[500px] text-sm text-surface-300 font-mono">
              {JSON.stringify(generateJSON(), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
