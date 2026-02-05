import { create } from 'zustand'
import type {
  CouponType,
  CouponTypeCreate,
  EligibilityRules,
  DiscountRules,
  Condition,
  ScopeConfig,
} from '@/types'
import {
  DiscountScope,
  ConditionField,
  ConditionOperator,
  ConditionLogic,
  DiscountAxis,
  DiscountUnit,
  WindowType,
} from '@/types'
import { couponTypesApi } from '@/lib/api'

// 기본 scope 설정
const defaultScopes: ScopeConfig[] = [
  {
    scope: DiscountScope.UNLOCK,
    enabled: false,
    target_field: 'unlock_fee',
    discount_axis: DiscountAxis.NONE,
    discount_unit: DiscountUnit.NONE,
  },
  {
    scope: DiscountScope.RIDE,
    enabled: false,
    target_field: 'ride_fee',
    window: { type: WindowType.ALL },
    discount_axis: DiscountAxis.NONE,
    discount_unit: DiscountUnit.NONE,
  },
  {
    scope: DiscountScope.ORDER,
    enabled: false,
    target_field: 'pricing_order_amount',
    discount_axis: DiscountAxis.NONE,
    discount_unit: DiscountUnit.NONE,
  },
]

interface CouponTypeState {
  // 목록
  couponTypes: CouponType[]
  isLoading: boolean
  error: string | null

  // 편집 중인 쿠폰 타입
  editingId: string | null
  name: string
  description: string
  eligibilityRules: EligibilityRules
  discountRules: DiscountRules

  // Actions - 목록
  fetchCouponTypes: () => Promise<void>
  deleteCouponType: (id: string) => Promise<void>

  // Actions - 편집
  setEditingId: (id: string | null) => void
  setName: (name: string) => void
  setDescription: (description: string) => void
  
  // Actions - Eligibility
  setEligibilityLogic: (logic: ConditionLogic) => void
  addCondition: () => void
  updateCondition: (index: number, updates: Partial<Condition>) => void
  removeCondition: (index: number) => void

  // Actions - Discount Rules
  updateScope: (scope: DiscountScope, updates: Partial<ScopeConfig>) => void

  // Actions - 저장/로드
  loadCouponType: (id: string) => Promise<void>
  saveCouponType: () => Promise<CouponType>
  resetForm: () => void
  
  // Getters
  generateJSON: () => CouponTypeCreate
}

export const useCouponTypeStore = create<CouponTypeState>((set, get) => ({
  // 초기 상태
  couponTypes: [],
  isLoading: false,
  error: null,

  editingId: null,
  name: '',
  description: '',
  eligibilityRules: {
    conditions: [],
    logic: ConditionLogic.AND,
  },
  discountRules: {
    scopes: [...defaultScopes],
  },

  // 목록 조회
  fetchCouponTypes: async () => {
    set({ isLoading: true, error: null })
    try {
      const couponTypes = await couponTypesApi.list()
      set({ couponTypes, isLoading: false })
    } catch (err) {
      set({ error: '쿠폰 타입 목록을 불러오는데 실패했습니다', isLoading: false })
    }
  },

  // 삭제
  deleteCouponType: async (id: string) => {
    try {
      await couponTypesApi.delete(id)
      set((state) => ({
        couponTypes: state.couponTypes.filter((ct) => ct.id !== id),
      }))
    } catch (err) {
      set({ error: '삭제에 실패했습니다' })
    }
  },

  // 편집 ID 설정
  setEditingId: (id) => set({ editingId: id }),
  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),

  // Eligibility 조건 로직
  setEligibilityLogic: (logic) =>
    set((state) => ({
      eligibilityRules: { ...state.eligibilityRules, logic },
    })),

  addCondition: () =>
    set((state) => ({
      eligibilityRules: {
        ...state.eligibilityRules,
        conditions: [
          ...state.eligibilityRules.conditions,
          {
            field: ConditionField.RIDE_DISTANCE,
            operator: ConditionOperator.GTE,
            value: 0,
          },
        ],
      },
    })),

  updateCondition: (index, updates) =>
    set((state) => ({
      eligibilityRules: {
        ...state.eligibilityRules,
        conditions: state.eligibilityRules.conditions.map((c, i) =>
          i === index ? { ...c, ...updates } : c
        ),
      },
    })),

  removeCondition: (index) =>
    set((state) => ({
      eligibilityRules: {
        ...state.eligibilityRules,
        conditions: state.eligibilityRules.conditions.filter((_, i) => i !== index),
      },
    })),

  // Scope 업데이트 (ORDER와 UNLOCK/RIDE 상호 배타)
  updateScope: (scope, updates) =>
    set((state) => {
      let newScopes = state.discountRules.scopes.map((s) =>
        s.scope === scope ? { ...s, ...updates } : s
      )

      // ORDER와 UNLOCK/RIDE 상호 배타 규칙
      if (updates.enabled === true) {
        if (scope === DiscountScope.ORDER) {
          // ORDER 활성화 → UNLOCK, RIDE 비활성화
          newScopes = newScopes.map((s) =>
            s.scope === DiscountScope.UNLOCK || s.scope === DiscountScope.RIDE
              ? { ...s, enabled: false }
              : s
          )
        } else if (scope === DiscountScope.UNLOCK || scope === DiscountScope.RIDE) {
          // UNLOCK/RIDE 활성화 → ORDER 비활성화
          newScopes = newScopes.map((s) =>
            s.scope === DiscountScope.ORDER ? { ...s, enabled: false } : s
          )
        }
      }

      return {
        discountRules: {
          ...state.discountRules,
          scopes: newScopes,
        },
      }
    }),

  // 쿠폰 타입 로드
  loadCouponType: async (id) => {
    set({ isLoading: true })
    try {
      const ct = await couponTypesApi.get(id)
      
      // 기존 scopes와 병합 (없는 scope는 기본값 사용)
      const loadedScopes = ct.discount_rules?.scopes || []
      const mergedScopes = defaultScopes.map((defaultScope) => {
        const loaded = loadedScopes.find((s) => s.scope === defaultScope.scope)
        return loaded || defaultScope
      })
      
      set({
        editingId: ct.id,
        name: ct.name,
        description: ct.description || '',
        eligibilityRules: ct.eligibility_rules || { conditions: [], logic: ConditionLogic.AND },
        discountRules: { scopes: mergedScopes },
        isLoading: false,
      })
    } catch (err) {
      set({ error: '쿠폰 타입을 불러오는데 실패했습니다', isLoading: false })
    }
  },

  // 저장
  saveCouponType: async () => {
    const state = get()
    const data = state.generateJSON()

    if (state.editingId) {
      // 수정
      const updated = await couponTypesApi.update(state.editingId, data)
      set((s) => ({
        couponTypes: s.couponTypes.map((ct) => (ct.id === updated.id ? updated : ct)),
      }))
      return updated
    } else {
      // 생성
      const created = await couponTypesApi.create(data)
      set((s) => ({
        couponTypes: [...s.couponTypes, created],
      }))
      return created
    }
  },

  // 폼 초기화
  resetForm: () =>
    set({
      editingId: null,
      name: '',
      description: '',
      eligibilityRules: { conditions: [], logic: ConditionLogic.AND },
      discountRules: { scopes: [...defaultScopes] },
    }),

  // JSON 생성
  generateJSON: () => {
    const state = get()
    return {
      name: state.name,
      description: state.description || undefined,
      eligibility_rules:
        state.eligibilityRules.conditions.length > 0 ? state.eligibilityRules : undefined,
      discount_rules: state.discountRules,
      is_active: true,
    }
  },
}))
