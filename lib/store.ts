import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
	id: string;
	email: string;
	name: string;
	role: string;
	image?: string;
}

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	error: string | null;
	loading: boolean;
	login: (user: User, token: string) => void;
	logout: () => void;
	setError: (error: string | null) => void;
	setLoading: (loading: boolean) => void;
	clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			isAuthenticated: false,
			error: null,
			loading: false,
			login: (user, token) => {
				set({ user, token, isAuthenticated: true, error: null });
			},
			logout: () => {
				set({ user: null, token: null, isAuthenticated: false, error: null });
			},
			setError: (error) => {
				set({ error, loading: false });
			},
			setLoading: (loading) => {
				set({ loading, error: null });
			},
			clearError: () => {
				set({ error: null });
			},
		}),
		{
			name: 'auth-storage',
			storage: {
				getItem: (name) => {
					const str = localStorage.getItem(name);
					if (!str) return null;
					try {
						return JSON.parse(str);
					} catch {
						return null;
					}
				},
				setItem: (name, value) => {
					localStorage.setItem(name, JSON.stringify(value));
				},
				removeItem: (name) => localStorage.removeItem(name),
			},
		}
	)
);
