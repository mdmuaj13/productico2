"use client"

import { useApi, apiCall } from '@/lib/api'
import { CreateDiscountData, UpdateDiscountData } from '@/lib/validations/discount'

export interface Discount {
  _id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrderAmount?: number
  maxUses?: number | null
  usedCount: number
  startDate?: string | null
  endDate?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface DiscountsResponse {
  data: Discount[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const useDiscounts = (params?: {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}) => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.set('page', params.page.toString())
  if (params?.limit) queryParams.set('limit', params.limit.toString())
  if (params?.search) queryParams.set('search', params.search)
  if (typeof params?.isActive === 'boolean') queryParams.set('isActive', String(params.isActive))

  const url = `/api/discounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

  return useApi(url) as { data: DiscountsResponse | undefined; error: unknown; mutate: () => void }
}

export const useDiscount = (id: string) => {
  return useApi(`/api/discounts/${id}`)
}

export const createDiscount = async (data: CreateDiscountData) => {
  return apiCall('/api/discounts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const updateDiscount = async (id: string, data: UpdateDiscountData) => {
  return apiCall(`/api/discounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export const deleteDiscount = async (id: string) => {
  return apiCall(`/api/discounts/${id}`, {
    method: 'DELETE',
  })
}
