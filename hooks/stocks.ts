"use client"

import { useApi, apiCall } from '@/lib/api'

interface Variant {
	name: string;
	price: number;
	salePrice?: number;
}

interface Product {
	_id: string;
	title: string;
	slug: string;
	thumbnail?: string;
	variants: Variant[];
}

interface Warehouse {
	_id: string;
	title: string;
	slug: string;
}

interface Stock {
	_id: string;
	productId: Product;
	variantName: string | null;
	warehouseId: Warehouse;
	quantity: number;
	reorderPoint?: number;
	createdAt: string;
	updatedAt: string;
}

interface StockListResponse {
	data: Stock[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export const useStocks = (params?: {
	page?: number;
	limit?: number;
	productId?: string;
	warehouseId?: string;
}) => {
	const queryParams = new URLSearchParams();
	if (params?.page) queryParams.set('page', params.page.toString());
	if (params?.limit) queryParams.set('limit', params.limit.toString());
	if (params?.productId) queryParams.set('productId', params.productId);
	if (params?.warehouseId) queryParams.set('warehouseId', params.warehouseId);

	const url = `/api/stocks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

	return useApi<StockListResponse>(url);
};

export const useStock = (id: string) => {
	return useApi<{ data: Stock }>(`/api/stocks/${id}`);
};

export const createStock = async (data: {
	productId: string;
	variantName?: string | null;
	warehouseId: string;
	quantity: number;
	reorderPoint?: number;
}) => {
	return apiCall('/api/stocks', {
		method: 'POST',
		body: JSON.stringify(data),
	});
};

export const updateStock = async (id: string, data: {
	quantity?: number;
	reorderPoint?: number;
}) => {
	return apiCall(`/api/stocks/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(data),
	});
};

export const deleteStock = async (id: string) => {
	return apiCall(`/api/stocks/${id}`, {
		method: 'DELETE',
	});
};
