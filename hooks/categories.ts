"use client"

import { useApi, apiCall } from '@/lib/api'
import { CreateCategoryData, UpdateCategoryData } from '@/lib/validations/category'

interface Category {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	image?: string;
	serialNo: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface CategoryListResponse {
	data: Category[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export const useCategories = (params?: {
	page?: number;
	limit?: number;
	search?: string;
	isActive?: boolean;
}) => {
	const queryParams = new URLSearchParams();
	if (params?.page) queryParams.set('page', params.page.toString());
	if (params?.limit) queryParams.set('limit', params.limit.toString());
	if (params?.search) queryParams.set('search', params.search);
	if (params?.isActive !== undefined) queryParams.set('isActive', params.isActive.toString());

	const url = `/api/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

	return useApi<CategoryListResponse>(url);
};

export const useCategory = (id: string) => {
	return useApi<{ data: Category }>(`/api/categories/${id}`);
};

export const createCategory = async (data: CreateCategoryData) => {
	return apiCall('/api/categories', {
		method: 'POST',
		body: JSON.stringify(data),
	});
};

export const updateCategory = async (id: string, data: UpdateCategoryData) => {
	return apiCall(`/api/categories/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
};

export const deleteCategory = async (id: string) => {
	return apiCall(`/api/categories/${id}`, {
		method: 'DELETE',
	});
};