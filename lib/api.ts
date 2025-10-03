import useSWR from 'swr';
import { useAuthStore } from '../store/store';

const handleUnauthorized = () => {
	const { logout } = useAuthStore.getState();
	logout();
	if (typeof window !== 'undefined') {
		window.location.href = '/login';
	}
};

const fetcher = async (url: string, token?: string) => {
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
	};

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const res = await fetch(url, { headers });

	if (res.status === 401) {
		handleUnauthorized();
		throw new Error('Unauthorized');
	}

	if (!res.ok) {
		throw new Error('Failed to fetch');
	}

	return res.json();
};

export const useApi = (url: string) => {
	const token = useAuthStore((state) => state.token);

	return useSWR(url, (url) => fetcher(url, token || undefined));
};

export const apiCall = async (url: string, options: RequestInit = {}) => {
	const token = useAuthStore.getState().token;

	const headers: Record<string, string> = {
		...(options.headers as Record<string, string>),
	};

	// Only set Content-Type for non-FormData requests
	if (!(options.body instanceof FormData)) {
		headers['Content-Type'] = 'application/json';
	}

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const res = await fetch(url, {
		...options,
		headers,
	});

	if (res.status === 401) {
		handleUnauthorized();
		throw new Error('Unauthorized');
	}

	return res.json();
};
