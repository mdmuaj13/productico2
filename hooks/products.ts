"use client"

import { useApi, apiCall } from '@/lib/api'
import { CreateProductData, UpdateProductData } from '@/lib/validations/product'

interface Product {
  _id: string
  title: string
  slug: string
  thumbnail?: string
  images: string[]
  description?: string
  shortDetail?: string
  price: number
  salePrice?: number
  unit: string
  tags: string[]
  categoryId: {
    _id: string
    name: string
    slug: string
  }
  variants: Array<{
    name: string
    price: number
    salePrice?: number
  }>
  createdAt: string
  updatedAt: string
}

interface ProductsResponse {
  data: Product[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const useProducts = (params?: {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
}) => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.set('page', params.page.toString())
  if (params?.limit) queryParams.set('limit', params.limit.toString())
  if (params?.search) queryParams.set('search', params.search)
  if (params?.categoryId) queryParams.set('categoryId', params.categoryId)

  const url = `/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

  return useApi<ProductsResponse>(url)
}

export const useProduct = (id: string) => {
  return useApi<{ data: Product }>(`/api/products/${id}`)
}

export const createProduct = async (data: CreateProductData) => {
  return apiCall('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const updateProduct = async (id: string, data: UpdateProductData) => {
  return apiCall(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export const deleteProduct = async (id: string) => {
  return apiCall(`/api/products/${id}`, {
    method: 'DELETE',
  })
}