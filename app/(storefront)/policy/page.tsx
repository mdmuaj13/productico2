import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type ApiSuccess<T> = { success: true; message: string; data: T };

type PolicyType = 'terms' | 'privacy' | 'refund';
type PolicyValue = { content: string; lastUpdated?: string };

function baseUrl() {
	return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

function parsePolicyType(value: unknown): PolicyType | null {
	if (value === 'terms' || value === 'privacy' || value === 'refund')
		return value;
	return null;
}

function policyTitle(type: PolicyType) {
	switch (type) {
		case 'terms':
			return 'Terms & Conditions';
		case 'privacy':
			return 'Privacy Policy';
		case 'refund':
			return 'Refund Policy';
	}
}

async function fetchPolicy(type: PolicyType): Promise<PolicyValue | null> {
	const res = await fetch(`${baseUrl()}/api/storefront?type=${type}`, {
		next: { revalidate: 60 },
	});
	if (!res.ok) return null;

	const json = (await res.json()) as ApiSuccess<{
		type: string;
		value: PolicyValue;
	}>;
	return json?.data?.value ?? null;
}

export async function generateMetadata({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
	const sp = await searchParams;
	const type = parsePolicyType(sp.type);
	const title = type ? policyTitle(type) : 'Policy';

	return {
		title,
	};
}

export default async function PolicyPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const sp = await searchParams;
	const type = parsePolicyType(sp.type);

	// If missing/invalid, you can redirect or show a nice chooser.
	if (!type) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
				<div className="container mx-auto px-4 py-10 max-w-3xl">
					<Link
						href="/"
						className="text-sm text-gray-600 dark:text-gray-300 hover:opacity-80">
						← Back to store
					</Link>

					<h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
						Policies
					</h1>

					<p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
						Choose a policy to view.
					</p>

					<div className="mt-6 grid gap-3 sm:grid-cols-3">
						<Link
							href="/policy?type=terms"
							className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/40 p-4 hover:shadow-sm transition">
							<div className="font-semibold text-gray-900 dark:text-white">
								Terms
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-300">
								Terms & conditions
							</div>
						</Link>

						<Link
							href="/policy?type=privacy"
							className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/40 p-4 hover:shadow-sm transition">
							<div className="font-semibold text-gray-900 dark:text-white">
								Privacy
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-300">
								Privacy policy
							</div>
						</Link>

						<Link
							href="/policy?type=refund"
							className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/40 p-4 hover:shadow-sm transition">
							<div className="font-semibold text-gray-900 dark:text-white">
								Refund
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-300">
								Refund & returns
							</div>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	const policy = await fetchPolicy(type);

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
			<div className="container mx-auto px-4 py-10 max-w-3xl">
				<div className="flex items-center justify-between gap-3">
					<Link
						href="/"
						className="text-sm text-gray-600 dark:text-gray-300 hover:opacity-80">
						← Back to store
					</Link>

					{/* Switcher */}
					<div className="flex gap-2">
						<Link
							href="/policy?type=terms"
							className={`text-xs px-3 py-1.5 rounded-full border transition ${
								type === 'terms'
									? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
									: 'bg-white/80 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-white'
							}`}>
							Terms
						</Link>
						<Link
							href="/policy?type=privacy"
							className={`text-xs px-3 py-1.5 rounded-full border transition ${
								type === 'privacy'
									? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
									: 'bg-white/80 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-white'
							}`}>
							Privacy
						</Link>
						<Link
							href="/policy?type=refund"
							className={`text-xs px-3 py-1.5 rounded-full border transition ${
								type === 'refund'
									? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
									: 'bg-white/80 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-white'
							}`}>
							Refund
						</Link>
					</div>
				</div>

				<h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
					{policyTitle(type)}
				</h1>

				{policy?.lastUpdated ? (
					<p className="mt-2 text-sm text-gray-500">
						Last updated: {policy.lastUpdated}
					</p>
				) : null}

				<div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/40 p-6">
					<div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
						{policy?.content || 'No content configured yet.'}
					</div>
				</div>
			</div>
		</div>
	);
}
