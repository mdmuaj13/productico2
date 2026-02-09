import type { ReactNode } from 'react';
import { StorefrontFooter } from './_components/storefront-footer';
import StorefrontHeader from './_components/storefront-header';

export const dynamic = 'force-dynamic';

function baseUrl() {
	return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

type ApiSuccess<T> = { success: true; message: string; data: T };

export type StorefrontInfo = {
	shopName: string;
	tagline?: string;
	logo?: string;
};

export type StorefrontContact = {
	email?: string;
	phone?: string;
	address?: string;
	city?: string;
	country?: string;
	socialLinks?: {
		facebook?: string;
		instagram?: string;
		twitter?: string;
		linkedin?: string;
	};
};

async function fetchStorefrontShell() {
	// You can fetch type=all if you want logo+tagline+social/footer
	const res = await fetch(`${baseUrl()}/api/storefront?type=all`, {
		next: { revalidate: 60 },
	});

	if (!res.ok) {
		return {
			info: null as StorefrontInfo | null,
			contact: null as StorefrontContact | null,
		};
	}

	const json = (await res.json()) as ApiSuccess<Record<string, any>>;
	const info = json.data?.info?.value ?? null;
	const contact = json.data?.contact?.value ?? null;

	return { info, contact };
}

export default async function StorefrontLayout({
	children,
}: {
	children: ReactNode;
}) {
	const { info, contact } = await fetchStorefrontShell();

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
			<StorefrontHeader info={info} />
			<main>{children}</main>
			<StorefrontFooter info={info} contact={contact} />
		</div>
	);
}
