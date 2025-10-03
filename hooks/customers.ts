import useSWR from 'swr';

interface Customer {
	_id: string;
	name: string;
	email: string;
	phone: string;
	company?: string;
	address?: string;
	city?: string;
	country?: string;
	postalCode?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface CustomersResponse {
	data: Customer[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

interface UseCustomersParams {
	page?: number;
	limit?: number;
}

// Placeholder fetcher - will be replaced with actual API call
const fetcher = async (url: string) => {
	// TODO: Replace with actual API call when backend is ready
	console.log('Fetching customers from:', url);

	// Return mock data for now
	return {
		data: [],
		meta: {
			total: 0,
			page: 1,
			limit: 10,
			totalPages: 0,
		},
	};
};

export function useCustomers({ page = 1, limit = 10 }: UseCustomersParams = {}) {
	const { data, error, mutate } = useSWR<CustomersResponse>(
		`/api/customers?page=${page}&limit=${limit}`,
		fetcher
	);

	return {
		data,
		error,
		mutate,
		isLoading: !data && !error,
	};
}

export async function createCustomer(data: {
	name: string;
	email: string;
	phone: string;
	company?: string;
	address?: string;
	city?: string;
	country?: string;
	postalCode?: string;
	isActive: boolean;
}) {
	// TODO: Replace with actual API call when backend is ready
	console.log('Creating customer:', data);

	// Simulate API call
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({ success: true, data });
		}, 500);
	});
}

export async function updateCustomer(
	id: string,
	data: {
		name: string;
		email: string;
		phone: string;
		company?: string;
		address?: string;
		city?: string;
		country?: string;
		postalCode?: string;
		isActive: boolean;
	}
) {
	// TODO: Replace with actual API call when backend is ready
	console.log('Updating customer:', id, data);

	// Simulate API call
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({ success: true, data });
		}, 500);
	});
}

export async function deleteCustomer(id: string) {
	// TODO: Replace with actual API call when backend is ready
	console.log('Deleting customer:', id);

	// Simulate API call
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({ success: true });
		}, 500);
	});
}
