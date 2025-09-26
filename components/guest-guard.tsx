'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/store';

interface GuestGuardProps {
	children: React.ReactNode;
}

export default function GuestGuard({ children }: GuestGuardProps) {
	const { isAuthenticated, user } = useAuthStore();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Give time for zustand to hydrate from localStorage
		const timer = setTimeout(() => {
			setIsLoading(false);
			if (isAuthenticated && user) {
				router.push('/app');
			}
		}, 100);

		return () => clearTimeout(timer);
	}, [isAuthenticated, user, router]);

	if (isLoading || (isAuthenticated && user)) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
					<p className="mt-2 text-sm text-gray-600">Redirecting...</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
