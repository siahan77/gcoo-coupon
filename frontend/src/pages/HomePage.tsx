import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCouponTypeStore } from '@/store/couponTypeStore'

export default function HomePage() {
  const navigate = useNavigate()
  const { couponTypes, isLoading, fetchCouponTypes, deleteCouponType, resetForm } =
    useCouponTypeStore()

  useEffect(() => {
    fetchCouponTypes()
  }, [])

  const handleCreate = () => {
    resetForm()
    navigate('/builder')
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`"${name}" 쿠폰 타입을 삭제하시겠습니까?`)) {
      await deleteCouponType(id)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">🎫 쿠폰 시뮬레이터</h1>
        <p className="text-xl text-surface-400 max-w-2xl mx-auto">
          Low-code 방식으로 쿠폰 타입을 생성하고,
          <br />
          트립 데이터를 기반으로 할인 금액을 시뮬레이션합니다.
        </p>
      </div>

      {/* 3-Step Flow */}
      <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-12">
        <button
          onClick={handleCreate}
          className="group bg-surface-800 rounded-2xl p-6 border border-surface-700 hover:border-primary-500 transition-all hover:shadow-xl hover:shadow-primary-500/10 text-left relative overflow-hidden"
        >
          <div className="absolute top-2 right-3 text-6xl font-black text-surface-700/50">1</div>
          <div className="text-3xl mb-3">🔧</div>
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
            쿠폰타입 생성
          </h2>
          <p className="text-sm text-surface-400">
            할인 규칙과 필요한 값(value) 스키마를 정의합니다.
          </p>
        </button>

        <Link
          to="/coupons"
          className="group bg-surface-800 rounded-2xl p-6 border border-surface-700 hover:border-primary-500 transition-all hover:shadow-xl hover:shadow-primary-500/10 relative overflow-hidden"
        >
          <div className="absolute top-2 right-3 text-6xl font-black text-surface-700/50">2</div>
          <div className="text-3xl mb-3">🎫</div>
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
            쿠폰 생성
          </h2>
          <p className="text-sm text-surface-400">
            쿠폰타입을 선택하고 실제 할인 값을 입력합니다.
          </p>
        </Link>

        <Link
          to="/simulator"
          className="group bg-surface-800 rounded-2xl p-6 border border-surface-700 hover:border-primary-500 transition-all hover:shadow-xl hover:shadow-primary-500/10 relative overflow-hidden"
        >
          <div className="absolute top-2 right-3 text-6xl font-black text-surface-700/50">3</div>
          <div className="text-3xl mb-3">🧪</div>
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
            시뮬레이션
          </h2>
          <p className="text-sm text-surface-400">
            쿠폰과 트립 데이터로 할인을 시뮬레이션합니다.
          </p>
        </Link>
      </div>

      {/* Flow Diagram */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-surface-800/50 rounded-xl p-4 border border-surface-700">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">1</span>
              <span className="text-surface-300">쿠폰타입</span>
            </div>
            <span className="text-surface-600">→</span>
            <div className="text-surface-500 text-xs">(value_schema 정의)</div>
            <span className="text-surface-600">→</span>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">2</span>
              <span className="text-surface-300">쿠폰</span>
            </div>
            <span className="text-surface-600">→</span>
            <div className="text-surface-500 text-xs">(실제 value 입력)</div>
            <span className="text-surface-600">→</span>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">3</span>
              <span className="text-surface-300">시뮬레이션</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Types List */}
      <div className="bg-surface-800 rounded-2xl border border-surface-700 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-surface-700">
          <h3 className="text-xl font-bold text-white">📋 쿠폰 타입 목록</h3>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
          >
            + 새로 만들기
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-surface-400">로딩 중...</div>
        ) : couponTypes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-surface-400 mb-4">아직 생성된 쿠폰 타입이 없습니다.</p>
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              첫 쿠폰 타입 만들기
            </button>
          </div>
        ) : (
          <div className="divide-y divide-surface-700">
            {couponTypes.map((ct) => (
              <div
                key={ct.id}
                className="p-4 hover:bg-surface-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-white">{ct.name}</h4>
                      {!ct.is_active && (
                        <span className="px-2 py-0.5 bg-surface-600 text-surface-400 text-xs rounded">
                          비활성
                        </span>
                      )}
                    </div>
                    {ct.description && (
                      <p className="text-sm text-surface-400 mt-1">{ct.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                      <span>ID: {ct.id.slice(0, 8)}...</span>
                      <span>
                        생성: {new Date(ct.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      {ct.discount_rules?.scopes && (
                        <span>
                          활성 scope:{' '}
                          {ct.discount_rules.scopes
                            .filter((s) => s.enabled)
                            .map((s) => s.scope)
                            .join(', ') || '없음'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/builder/${ct.id}`}
                      className="px-3 py-1.5 bg-surface-600 hover:bg-surface-500 text-white text-sm rounded-lg transition-colors"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(ct.id, ct.name)}
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
