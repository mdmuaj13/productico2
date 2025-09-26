"use client"

import { useApi, apiCall } from '@/lib/api'

interface Vendor {
	_id: string;
	name: string;
	slug: string;
	email?: string;
	phone?: string;
	address?: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
}

interface PurchaseOrder {
	_id: string;
	title: string;
	po_date: string;
	vendor_id?: string;
	vendor?: Vendor;
	order_info?: string;
	price: number;
	status: 'pending' | 'approved' | 'received' | 'cancelled';
	createdAt: string;
	updatedAt: string;
}

interface PurchaseOrderListResponse {
	data: PurchaseOrder[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export const usePurchaseOrders = (params?: {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
}) => {
	const queryParams = new URLSearchParams();
	if (params?.page) queryParams.set('page', params.page.toString());
	if (params?.limit) queryParams.set('limit', params.limit.toString());
	if (params?.search) queryParams.set('search', params.search);
	if (params?.status) queryParams.set('status', params.status);

	const url = `/api/purchase-orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

	return useApi<PurchaseOrderListResponse>(url);
};

export const usePurchaseOrder = (id: string) => {
	return useApi<{ data: PurchaseOrder }>(`/api/purchase-orders/${id}`);
};

export const useVendors = () => {
	return useApi<{ data: Vendor[] }>('/api/vendors');
};

export const createPurchaseOrder = async (data: {
	title: string;
	po_date: string;
	vendor_id?: string;
	order_info?: string;
	price: number;
	status: 'pending' | 'approved' | 'received' | 'cancelled';
}) => {
	return apiCall('/api/purchase-orders', {
		method: 'POST',
		body: JSON.stringify(data),
	});
};

export const updatePurchaseOrder = async (id: string, data: {
	title?: string;
	po_date?: string;
	vendor_id?: string;
	order_info?: string;
	price?: number;
	status?: 'pending' | 'approved' | 'received' | 'cancelled';
}) => {
	return apiCall(`/api/purchase-orders/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
};

export const deletePurchaseOrder = async (id: string) => {
	return apiCall(`/api/purchase-orders/${id}`, {
		method: 'DELETE',
	});
};