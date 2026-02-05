import axios from 'axios'
import type {
  CouponType,
  CouponTypeCreate,
  Coupon,
  CouponCreate,
  SimulationRequest,
  SimulationResult,
} from '@/types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================
// Coupon Types API
// ============================================

export const couponTypesApi = {
  list: async (params?: { is_active?: boolean }) => {
    const { data } = await api.get<CouponType[]>('/coupon-types', { params })
    return data
  },

  get: async (id: string) => {
    const { data } = await api.get<CouponType>(`/coupon-types/${id}`)
    return data
  },

  create: async (couponType: CouponTypeCreate) => {
    const { data } = await api.post<CouponType>('/coupon-types', couponType)
    return data
  },

  update: async (id: string, couponType: Partial<CouponTypeCreate>) => {
    const { data } = await api.put<CouponType>(`/coupon-types/${id}`, couponType)
    return data
  },

  delete: async (id: string) => {
    await api.delete(`/coupon-types/${id}`)
  },
}

// ============================================
// Coupons API
// ============================================

export const couponsApi = {
  list: async (params?: { coupon_type_id?: string }) => {
    const { data } = await api.get<Coupon[]>('/coupons', { params })
    return data
  },

  get: async (id: string) => {
    const { data } = await api.get<Coupon>(`/coupons/${id}`)
    return data
  },

  create: async (coupon: CouponCreate) => {
    const { data } = await api.post<Coupon>('/coupons', coupon)
    return data
  },

  update: async (id: string, coupon: Partial<CouponCreate>) => {
    const { data } = await api.put<Coupon>(`/coupons/${id}`, coupon)
    return data
  },

  delete: async (id: string) => {
    await api.delete(`/coupons/${id}`)
  },
}

// ============================================
// Simulation API
// ============================================

export const simulationApi = {
  simulate: async (request: SimulationRequest) => {
    const { data } = await api.post<SimulationResult>('/simulation', request)
    return data
  },
}

export default api
