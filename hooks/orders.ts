"use client"

import { useApi, apiCall } from '@/lib/api'

export interface OrderProduct {
	_id: string;
	slug?: string;
	title: string;
	thumbnail?: string;
	basePrice: number;
	price: number;
	quantity: number;
	variantName: string | null;
	variantPrice: number | null;
	variantSalePrice: number | null;
	warehouseId: string;
	lineTotal: number;
}

export interface Order {
	_id: string;
	customerName: string;
	customerMobile: string;
	customerEmail?: string;
	customerAddress: string;
	customerDistrict?: string;
	code: string;
	trackingCode?: string;
	products: OrderProduct[];
	subTotal: number;
	total: number;
	discount: number;
	deliveryCost: number;
	tax: number;
	paid: number;
	due: number;
	paymentStatus: 'unpaid' | 'partial' | 'paid';
	paymentType: string;
	status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
	remark?: string;
	createdById?: string;
	createdAt: string;
	updatedAt: string;
}

interface OrdersResponse {
	data: Order[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export const useOrders = (params?: {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
	paymentStatus?: string;
	sortBy?: string;
  	sortOrder?: "asc" | "desc";
}) => {
	const queryParams = new URLSearchParams();
	if (params?.page) queryParams.set('page', params.page.toString());
	if (params?.limit) queryParams.set('limit', params.limit.toString());
	if (params?.search) queryParams.set('search', params.search);
	if (params?.status) queryParams.set('status', params.status);
	if (params?.paymentStatus) queryParams.set('paymentStatus', params.paymentStatus);
	if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
	if (params?.sortOrder) queryParams.set('sortOrder', params.sortOrder);

	const url = `/api/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

	return useApi(url);
};

export const useOrder = (id: string) => {
	return useApi(`/api/orders/${id}`);
};

export const createOrder = async (data: any) => {
	return apiCall('/api/orders', {
		method: 'POST',
		body: JSON.stringify(data),
	});
};

export const updateOrder = async (id: string, data: any) => {
	return apiCall(`/api/orders/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
};

export const deleteOrder = async (id: string) => {
	return apiCall(`/api/orders/${id}`, {
		method: 'DELETE',
	});
};
