import useSWR from 'swr'
import { useAuthStore } from './store'

const fetcher = async (url: string, token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(url, { headers })

  if (!res.ok) {
    throw new Error('Failed to fetch')
  }

  return res.json()
}

export const useApi = (url: string) => {
  const token = useAuthStore((state) => state.token)

  return useSWR(url, (url) => fetcher(url, token || undefined))
}

export const apiCall = async (url: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  return res.json()
}