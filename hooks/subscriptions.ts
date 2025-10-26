import { useApi, apiCall } from '@/lib/api';
import {
	CreateSubscriptionInput,
	UpdateSubscriptionInput,
	AssignSubscriptionInput,
} from '@/lib/validations/subscription';

interface UseSubscriptionsParams {
	page?: number;
	limit?: number;
	search?: string;
	isActive?: boolean;
}

// Hook to get all subscriptions
export const useSubscriptions = (params?: UseSubscriptionsParams) => {
	const queryParams = new URLSearchParams();

	if (params?.page) queryParams.append('page', params.page.toString());
	if (params?.limit) queryParams.append('limit', params.limit.toString());
	if (params?.search) queryParams.append('search', params.search);
	if (params?.isActive !== undefined)
		queryParams.append('isActive', params.isActive.toString());

	const url = `/api/subscriptions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

	return useApi(url);
};

// Hook to get single subscription
export const useSubscription = (id: string | null) => {
	const url = id ? `/api/subscriptions/${id}` : null;
	return useApi(url as any);
};

// Create subscription
export const createSubscription = async (data: CreateSubscriptionInput) => {
	return apiCall('/api/subscriptions', {
		method: 'POST',
		body: JSON.stringify(data),
	});
};

// Update subscription
export const updateSubscription = async (
	id: string,
	data: UpdateSubscriptionInput
) => {
	return apiCall(`/api/subscriptions/${id}`, {
		method: 'PUT',
		body: JSON.stringify(data),
	});
};

// Delete subscription
export const deleteSubscription = async (id: string) => {
	return apiCall(`/api/subscriptions/${id}`, {
		method: 'DELETE',
	});
};

// Assign subscription to user
export const assignSubscription = async (data: AssignSubscriptionInput) => {
	return apiCall('/api/subscriptions/assign', {
		method: 'POST',
		body: JSON.stringify(data),
	});
};
