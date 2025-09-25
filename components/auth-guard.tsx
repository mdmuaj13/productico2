'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

interface AuthGuardProps {
	children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
	const { isAuthenticated, user } = useAuthStore();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Give time for zustand to hydrate from localStorage
		const timer = setTimeout(() => {
			setIsLoading(false);
			if (!isAuthenticated || !user) {
				router.push('/login');
			}
		}, 100);

		return () => clearTimeout(timer);
	}, [isAuthenticated, user, router]);

	if (isLoading || !isAuthenticated || !user) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				{/* <Spinner variant="pinwheel" /> */}
			</div>
		);
	}

	return <>{children}</>;
}
