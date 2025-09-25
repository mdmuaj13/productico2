"use client"

import { useApi, apiCall } from '@/lib/api'

interface Vendor {
	_id: string;
	name: string;
	contact_number: string;
	email?: string;
	address?: string;
	remarks?: string;
	createdAt: string;
	updatedAt: string;
}

interface VendorListResponse {
	data: Vendor[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export const useVendors = (params?: {
	page?: number;
	limit?: number;
	search?: string;
}) => {
	const queryParams = new URLSearchParams();
	if (params?.page) queryParams.set('page', params.page.toString());
	if (params?.limit) queryParams.set('limit', params.limit.toString());
	if (params?.search) queryParams.set('search', params.search);

	const url = `/api/vendors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

	return useApi<VendorListResponse>(url);
};

export const useVendor = (id: string) => {
	return useApi<{ data: Vendor }>(`/api/vendors/${id}`);
};

export const createVendor = async (data: {
	name: string;
	contact_number: string;
	email?: string;
	address?: string;
	remarks?: string;
}) => {
	return apiCall('/api/vendors', {
		method: 'POST',
		body: JSON.stringify(data),
	});
};

export const updateVendor = async (id: string, data: {
	name?: string;
	contact_number?: string;
	email?: string;
	address?: string;
	remarks?: string;
}) => {
	return apiCall(`/api/vendors/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
};

export const deleteVendor = async (id: string) => {
	return apiCall(`/api/vendors/${id}`, {
		method: 'DELETE',
	});
};