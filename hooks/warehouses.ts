"use client"

import { useApi, apiCall } from '@/lib/api'

interface Warehouse {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	address: string;
	createdAt: string;
	updatedAt: string;
}

interface WarehouseListResponse {
	data: Warehouse[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export const useWarehouses = (params?: {
	page?: number;
	limit?: number;
	search?: string;
}) => {
	const queryParams = new URLSearchParams();
	if (params?.page) queryParams.set('page', params.page.toString());
	if (params?.limit) queryParams.set('limit', params.limit.toString());
	if (params?.search) queryParams.set('search', params.search);

	const url = `/api/warehouses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

	return useApi(url);
};

export const useWarehouse = (id: string) => {
	return useApi(`/api/warehouses/${id}`);
};

export const createWarehouse = async (data: {
	title: string;
	description?: string;
	address: string;
}) => {
	return apiCall('/api/warehouses', {
		method: 'POST',
		body: JSON.stringify(data),
	});
};

export const updateWarehouse = async (id: string, data: {
	title?: string;
	description?: string;
	address?: string;
}) => {
	return apiCall(`/api/warehouses/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
};

export const deleteWarehouse = async (id: string) => {
	return apiCall(`/api/warehouses/${id}`, {
		method: 'DELETE',
	});
};