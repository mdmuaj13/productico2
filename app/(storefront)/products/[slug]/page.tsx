import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

import {
	ChevronLeft,
	ChevronRight,
	Tag,
	Boxes,
	ShieldCheck,
	Truck,
	RotateCcw,
	Headphones,
} from 'lucide-react';

import ProductClient from './product-client';

type ApiSuccess<T> = { success: true; message: string; data: T; meta?: any };

type Category = {
	_id: string;
	name?: string;
	title?: string;
	slug?: string;
	image?: string;
};

export type Product = {
	_id: string;
	title: string;
	slug?: string;
	description?: string;
	shortDetail?: string;
	price?: number;
	salePrice?: number;
	unit?: string;
	tags?: string[];
	thumbnail?: string;
	images?: string[];
	categoryId?: Category;
	variants?: any[];
};

function baseUrl() {
	return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

async function fetchProductBySlug(slug: string): Promise<Product | null> {
	const res = await fetch(
		`${baseUrl()}/api/products/by-slug/${encodeURIComponent(slug)}`,
		{ next: { revalidate: 30 } },
	);

	if (!res.ok) return null;

	const json = (await res.json()) as ApiSuccess<Product>;
	return json?.data ?? null;
}

function firstImage(p: Product) {
	return p.thumbnail || p.images?.[0] || '';
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const product = await fetchProductBySlug(slug);

	if (!product) return { title: 'Product' };

	return {
		title: product.title,
		description: product.shortDetail || product.description,
		openGraph: {
			title: product.title,
			description: product.shortDetail || product.description,
			images: firstImage(product) ? [firstImage(product)] : undefined,
		},
	};
}

function Chip({
	icon: Icon,
	children,
	tone = 'default',
}: {
	icon: React.ComponentType<{ className?: string }>;
	children: React.ReactNode;
	tone?: 'default' | 'success';
}) {
	const base =
		'inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border bg-white/70 dark:bg-gray-900/40';
	const toneCls =
		tone === 'success'
			? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
			: 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200';

	return (
		<span className={`${base} ${toneCls}`}>
			<Icon className="h-3.5 w-3.5 opacity-80" />
			{children}
		</span>
	);
}

function InfoCard({
	icon: Icon,
	title,
	desc,
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	desc: string;
}) {
	return (
		<div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 p-4">
			<div className="flex gap-3">
				<div className="h-10 w-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/30 grid place-items-center">
					<Icon className="h-5 w-5 text-gray-800 dark:text-gray-100" />
				</div>
				<div className="min-w-0">
					<div className="text-sm font-semibold text-gray-900 dark:text-white">
						{title}
					</div>
					<div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
						{desc}
					</div>
				</div>
			</div>
		</div>
	);
}

export default async function ProductBySlugPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	const product = await fetchProductBySlug(slug);
	if (!product) notFound();

	const categoryLabel = product.categoryId?.name || product.categoryId?.title;
	const sale = typeof product.salePrice === 'number';
	const imgs = Array.from(
		new Set([product.thumbnail, ...(product.images || [])].filter(Boolean)),
	) as string[];

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
			<main className="container mx-auto px-4 py-8">
				{/* Breadcrumb-ish */}
				<div className="mb-6 text-xs text-gray-500 dark:text-gray-400">
					<Link href="/" className="hover:opacity-80">
						Store
					</Link>
					<span className="mx-2">/</span>
					<Link href="/products" className="hover:opacity-80">
						Products
					</Link>
					<span className="mx-2">/</span>
					<span className="text-gray-700 dark:text-gray-200">
						{product.title}
					</span>
				</div>

				<div className="grid gap-8 lg:grid-cols-12">
					{/* Left: Gallery */}
					<section className="lg:col-span-7 space-y-4">
						<ProductClient product={product} images={imgs} mode="gallery" />

						{/* Trust strip */}
						<div className="grid sm:grid-cols-3 gap-3 pt-2">
							<InfoCard
								icon={Truck}
								title="Fast delivery"
								desc="Quick dispatch and updates."
							/>
							<InfoCard
								icon={RotateCcw}
								title="Easy returns"
								desc="Hassle-free policy (if applicable)."
							/>
							<InfoCard
								icon={Headphones}
								title="Support"
								desc="We’re here to help you."
							/>
						</div>
					</section>

					{/* Right: Details + buy box */}
					<aside className="lg:col-span-5">
						<div className="lg:sticky lg:top-[92px] space-y-4">
							<div className="space-y-3">
								<div className="flex flex-wrap gap-2">
									{categoryLabel ? (
										<Chip icon={Tag}>{categoryLabel}</Chip>
									) : null}
									{product.unit ? (
										<Chip icon={Boxes}>Unit: {product.unit}</Chip>
									) : null}
									{sale ? (
										<Chip icon={ShieldCheck} tone="success">
											On sale
										</Chip>
									) : null}
								</div>

								<h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
									{product.title}
								</h1>

								{product.shortDetail ? (
									<p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
										{product.shortDetail}
									</p>
								) : null}
							</div>

							{/* Buy box + quantity + actions */}
							<ProductClient product={product} images={imgs} mode="purchase" />

							{/* Tags */}
							{product.tags?.length ? (
								<div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 p-5">
									<div className="text-sm font-semibold text-gray-900 dark:text-white">
										Tags
									</div>
									<div className="mt-3 flex flex-wrap gap-2">
										{product.tags.slice(0, 14).map((t) => (
											<span
												key={t}
												className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200">
												{t}
											</span>
										))}
									</div>
								</div>
							) : null}
						</div>
					</aside>

					{/* Full description */}
					<section className="lg:col-span-12">
						<div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 p-6">
							<div className="text-sm font-semibold text-gray-900 dark:text-white">
								Description
							</div>
							<div className="mt-3 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
								{product.description || 'No description provided.'}
							</div>
						</div>
					</section>
				</div>
			</main>
		</div>
	);
}
