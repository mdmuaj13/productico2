'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Eye, Pencil, Plus, Search, SlidersHorizontal, Package, Trash, ChevronRight } from 'lucide-react';
import { useProducts, deleteProduct } from '@/hooks/products';
import { useCategories } from '@/hooks/categories';
import { ProductForm } from './product-form';
import { ProductEditForm } from './edit-form';
import { ProductView } from './view';
import { toast } from 'sonner';
import { SimpleTable } from '@/components/simple-table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Spinner } from '../ui/shadcn-io/spinner';
import { ServerPagination } from '@/components/server-pagination';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Variant {
	name: string;
	price: number;
	salePrice?: number;
}

interface Product {
	_id: string;
	title: string;
	slug: string;
	thumbnail?: string;
	categoryId: {
		_id: string;
		title: string;
		name?: string;
		slug: string;
	};
	price: number;
	salePrice?: number;
	unit: string;
	tags: string[];
	variants: Variant[];
	createdAt: string;
	updatedAt: string;
}

// Responsive media query hook
function useMediaQuery(query: string) {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);
		const onChange = () => setMatches(media.matches);
		onChange();

		if (media.addEventListener) media.addEventListener('change', onChange);
		else media.addListener(onChange);

		return () => {
			if (media.removeEventListener) media.removeEventListener('change', onChange);
			else media.removeListener(onChange);
		};
	}, [query]);

	return matches;
}

const money = (n: unknown) => `$${Number(n || 0).toFixed(2)}`;

const categoryLabel = (category: unknown) => {
	const c = category as any;
	return c?.title || c?.name || '—';
};

export function ProductsList() {
	// Server pagination state
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	// Filters
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<string>('all');

	// reset to page 1 on any filter change
	useEffect(() => {
		setPage(1);
	}, [search, categoryFilter, limit]);

	const [createSheetOpen, setCreateSheetOpen] = useState(false);
	const [editSheetOpen, setEditSheetOpen] = useState(false);
	const [viewSheetOpen, setViewSheetOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Check for mid-size devices (tablet range) and mobile
	const isMidSize = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
	const isMobile = useMediaQuery('(max-width: 639px)');
	const sheetSide = isMobile || isMidSize ? 'bottom' : 'right';

	const {
		data: productsData,
		error,
		mutate: mutateProducts,
	} = useProducts({
		page,
		limit,
		search,
		categoryId: categoryFilter === 'all' ? '' : categoryFilter,
	});

	const { data: categoriesData } = useCategories({ page: 1, limit: 1000, isActive: true });

	const products = productsData?.data || [];
	const meta = productsData?.meta;
	const categories = categoriesData?.data || [];

	const handleDeleteClick = (product: Product) => {
		setDeletingProduct(product);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!deletingProduct) return;

		setIsDeleting(true);
		try {
			await deleteProduct(deletingProduct._id);
			toast.success('Product deleted successfully');
			mutateProducts();
		} catch {
			toast.error('Failed to delete product');
		} finally {
			setIsDeleting(false);
			setDeleteDialogOpen(false);
			setDeletingProduct(null);
		}
	};

	const handleViewProduct = (product: Product) => {
		setViewingProduct(product);
		setViewSheetOpen(true);
	};

	const handleEditProduct = (product: Product) => {
		setEditingProduct(product);
		setEditSheetOpen(true);
	};

	const handleViewToEdit = () => {
		if (viewingProduct) {
			setViewSheetOpen(false);
			setEditingProduct(viewingProduct);
			setEditSheetOpen(true);
		}
	};

	const handleCreateSuccess = () => {
		setCreateSheetOpen(false);
		mutateProducts();
	};

	const handleEditSuccess = () => {
		setEditSheetOpen(false);
		setEditingProduct(null);
		mutateProducts();
	};

	const handleViewSuccess = () => {
		setViewSheetOpen(false);
		setViewingProduct(null);
		mutateProducts();
	};

	const columns = useMemo(
		() => [
			{
				key: 'title',
				header: 'Product',
				render: (value: unknown) => <span className="text-sm font-medium">{String(value || '—')}</span>,
			},
			{
				key: 'categoryId',
				header: 'Category',
				render: (value: unknown) => <span className="text-sm text-muted-foreground">{categoryLabel(value)}</span>,
			},
			{
				key: 'price',
				header: 'Price',
				render: (value: unknown, row: Product) => (
					<div className="">
						<div className="text-sm font-semibold tabular-nums">{money(row.salePrice ?? value)}</div>
						{row.salePrice ? (
							<div className="text-xs text-muted-foreground line-through tabular-nums">{money(row.price)}</div>
						) : null}
					</div>
				),
			},
			// {
			// 	key: 'unit',
			// 	header: 'Unit',
			// 	render: (value: unknown) => <span className="text-sm">{String(value || '—')}</span>,
			// },
			{
				key: 'variants',
				header: 'Variants',
				render: (value: unknown) => {
					const variants = value as Product['variants'];
					return <span className="text-sm tabular-nums">{variants?.length ?? 0}</span>;
				},
			},
			{
				key: 'createdAt',
				header: 'Created',
				render: (value: unknown) => (
					<span className="text-sm text-muted-foreground">
						{new Date(String(value)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
					</span>
				),
			},
		],
		[]
	);

	const actions = useMemo(
		() => [
			{ label: <Eye className="h-4 w-4" />, onClick: (p: Product) => handleViewProduct(p), variant: 'ghost' as const, size: 'icon' as const },
			{ label: <Pencil className="h-4 w-4" />, onClick: (p: Product) => handleEditProduct(p), variant: 'outline' as const, size: 'icon' as const },
			{ label: <Trash className="h-4 w-4" />, onClick: (p: Product) => handleDeleteClick(p), variant: 'destructive' as const, size: 'icon' as const },
		],
		[]
	);

	if (error) {
		return (
			<Card>
				<CardContent className="p-12 text-center">
					<div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4">
						<SlidersHorizontal className="h-5 w-5 text-destructive" />
					</div>
					<p className="text-muted-foreground">Failed to load products</p>
				</CardContent>
			</Card>
		);
	}

	const total = meta?.total ?? 0;
	const totalPages = meta?.totalPages ?? 1;
	const hasActiveFilters = search || categoryFilter !== 'all';

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSearch(searchInput.trim());
		setPage(1);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					{/* style={{ fontFamily: "'Instrument Serif', serif" }} */}
					<h1 className="text-2xl font-bold font-serif tracking-tight" >
						Products
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						{total} {total === 1 ? 'product' : 'products'} total
					</p>
				</div>

				<Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
					<SheetTrigger asChild>
						<Button className="gap-2">
							<Plus className="h-4 w-4" />
							Add Product
						</Button>
					</SheetTrigger>
					<SheetContent side={sheetSide} className={isMobile ? 'w-full h-[90vh]' : 'sm:max-w-4xl w-full'}>
						<div className="h-full px-4 py-4">
							<ProductForm onSuccess={handleCreateSuccess} />
						</div>
					</SheetContent>
				</Sheet>
			</div>

			{/* Filters Bar */}
			<div className="rounded-lg border bg-card p-4">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-6 sm:items-center">
					<form onSubmit={handleSearchSubmit} className="sm:col-span-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								placeholder="Search products..."
								className="pl-9 pr-10"
							/>
							<Button
								type="submit"
								variant="ghost"
								size="icon"
								className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
								aria-label="Search"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</form>

					<div className="sm:col-span-4 flex flex-col sm:flex-row gap-3 sm:justify-end">
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="h-10 sm:w-64">
								<SelectValue placeholder="Category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All categories</SelectItem>
								{categories.map((c: any) => (
									<SelectItem key={String(c._id)} value={String(c._id)}>
										{c.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<div className="flex justify-end sm:ml-2">
							{hasActiveFilters && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => {
										setSearchInput('');
										setSearch('');
										setCategoryFilter('all');
										setLimit(10);
										setPage(1);
									}}
									className="text-muted-foreground"
								>
									Clear filters
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Body */}
			{!productsData && !error ? (
				<div className="flex items-center justify-center py-20">
					<Spinner variant="pinwheel" />
				</div>
			) : products.length === 0 ? (
				<Card>
					<CardContent className="p-16 text-center">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
							<Package className="h-6 w-6 text-muted-foreground" />
						</div>
						<p className="text-muted-foreground">
							{hasActiveFilters ? 'No products match your filters.' : 'No products yet.'}
						</p>
					</CardContent>
				</Card>
			) : (
				<>
					{/* Mobile: cards */}
					<div className="grid grid-cols-1 gap-3 sm:hidden">
						{products.map((p: Product, idx: number) => (
							<button
								key={p._id}
								onClick={() => handleViewProduct(p)}
								className="text-left rounded-lg border bg-card p-4 transition-all hover:bg-muted/30 hover:shadow-md active:scale-[0.98]"
								style={{ animation: 'fadeInUp 0.4s ease-out backwards', animationDelay: `${idx * 40}ms` }}
							>
								<div className="flex items-start justify-between gap-3 mb-3">
									<div className="min-w-0 flex-1">
										<div className="text-sm font-medium truncate">{p.title}</div>
										<div className="mt-1 text-xs text-muted-foreground truncate">{categoryLabel(p.categoryId)}</div>
									</div>

									<div className="shrink-0 text-right">
										<div className="text-sm font-bold tabular-nums">{money(p.salePrice ?? p.price)}</div>
										{p.salePrice ? (
											<div className="text-xs text-muted-foreground line-through tabular-nums">{money(p.price)}</div>
										) : (
											<div className="text-xs text-muted-foreground">{p.unit}</div>
										)}
									</div>
								</div>

								<div className="flex items-center justify-between pt-3 border-t">
									<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
										<span className="tabular-nums">{p.variants?.length ?? 0} variants</span>
										<span className="text-muted-foreground">•</span>
										<span className="capitalize">{p.unit}</span>
									</div>
									<ChevronRight className="h-4 w-4 text-muted-foreground" />
								</div>
							</button>
						))}

						<ServerPagination
							page={meta?.page ?? page}
							totalPages={totalPages}
							total={total}
							limit={meta?.limit ?? limit}
							showingCount={products.length}
							onPageChange={(next) => setPage(next)}
							onLimitChange={(nextLimit) => {
								setLimit(nextLimit);
								setPage(1);
							}}
							className="pt-2"
						/>
					</div>

					{/* Desktop: table */}
					<div className="hidden sm:block rounded-lg border bg-card overflow-hidden">
						<SimpleTable data={products} columns={columns} actions={actions} showPagination={false} />

						<div className="border-t p-4">
							<ServerPagination
								page={meta?.page ?? page}
								totalPages={totalPages}
								total={total}
								limit={meta?.limit ?? limit}
								showingCount={products.length}
								onPageChange={(next) => setPage(next)}
								onLimitChange={(nextLimit) => {
									setLimit(nextLimit);
									setPage(1);
								}}
							/>
						</div>
					</div>
				</>
			)}

			{/* View Sheet */}
			<Sheet
				open={viewSheetOpen}
				onOpenChange={(open) => {
					setViewSheetOpen(open);
					if (!open) setViewingProduct(null);
				}}
			>
				<SheetContent
					side={sheetSide}
					className={isMobile ? 'w-full h-[85vh]' : isMidSize ? 'sm:max-w-[600px] h-[85vh]' : 'sm:max-w-[600px] w-full'}
				>
					<div className="h-full">
						{viewingProduct && (
							<ProductView
								product={viewingProduct}
								onEdit={handleViewToEdit}
								onSuccess={handleViewSuccess}
							/>
						)}
					</div>
				</SheetContent>
			</Sheet>

			{/* Edit Sheet */}
			<Sheet
				open={editSheetOpen}
				onOpenChange={(open) => {
					setEditSheetOpen(open);
					if (!open) setEditingProduct(null);
				}}
			>
				<SheetContent side={sheetSide} className={isMobile ? 'w-full h-[90vh]' : 'sm:max-w-4xl w-full'}>
					<div className="h-full">
						{editingProduct && (
							<ProductEditForm
								product={editingProduct}
								onSuccess={handleEditSuccess}
							/>
						)}
					</div>
				</SheetContent>
			</Sheet>

			{/* Delete Confirmation Dialog */}
			<ConfirmationDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={handleDeleteConfirm}
				title="Delete Product"
				description={`Are you sure you want to delete "${deletingProduct?.title}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				isLoading={isDeleting}
			/>

			<style jsx global>{`
				@keyframes fadeInUp {
					from {
						opacity: 0;
						transform: translateY(10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}</style>
		</div>
	);
}
