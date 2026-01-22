'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Eye, Pencil, Plus, Trash, Search, SlidersHorizontal, Package, ChevronRight } from 'lucide-react';
import { useCategories, deleteCategory } from '@/hooks/categories';
import { CategoryForm } from './create';
import { CategoryEditForm } from './edit-form';
import { CategoryView } from './view';
import { toast } from 'sonner';
import { SimpleTable } from '@/components/simple-table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Spinner } from '../ui/shadcn-io/spinner';
import { Badge } from '@/components/ui/badge';
import { ServerPagination } from '@/components/server-pagination';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	image?: string;
	serialNo: number;
	isActive: boolean;
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

const formatDate = (value: unknown) => {
	try {
		const date = new Date(String(value));
		if (isNaN(date.getTime())) return '—';
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	} catch {
		return '—';
	}
};

export function CategoriesList() {
	// Server pagination state
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	// Filters
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

	// reset to page 1 on any filter change
	useEffect(() => {
		setPage(1);
	}, [search, statusFilter, limit]);

	const [createSheetOpen, setCreateSheetOpen] = useState(false);
	const [editSheetOpen, setEditSheetOpen] = useState(false);
	const [viewSheetOpen, setViewSheetOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingCategory, setDeletingCategory] = useState<Category | null>(
		null
	);
	const [isDeleting, setIsDeleting] = useState(false);

	const {
		data: categoriesData,
		error,
		mutate: mutateCategories,
	} = useCategories({
		page,
		limit,
		search,
		isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
	});

	const categories = categoriesData?.data || [];
	const meta = categoriesData?.meta;

	const total = meta?.total ?? 0;
	const totalPages = meta?.totalPages ?? 1;

	const handleDeleteClick = (category: Category) => {
		setDeletingCategory(category);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!deletingCategory) return;

		setIsDeleting(true);
		try {
			await deleteCategory(deletingCategory._id);
			toast.success('Category deleted successfully');
			mutateCategories();
		} catch {
			toast.error('Failed to delete category');
		} finally {
			setIsDeleting(false);
			setDeleteDialogOpen(false);
			setDeletingCategory(null);
		}
	};

	const handleViewCategory = (category: Category) => {
		setViewingCategory(category);
		setViewSheetOpen(true);
	};

	const handleEditCategory = (category: Category) => {
		setEditingCategory(category);
		setEditSheetOpen(true);
	};

	const handleViewToEdit = () => {
		if (viewingCategory) {
			setViewSheetOpen(false);
			setEditingCategory(viewingCategory);
			setEditSheetOpen(true);
		}
	};

	const handleViewToDelete = () => {
		setViewSheetOpen(false);
		mutateCategories();
	};

	const handleCreateSuccess = () => {
		setCreateSheetOpen(false);
		mutateCategories();
	};

	const handleEditSuccess = () => {
		setEditSheetOpen(false);
		setEditingCategory(null);
		mutateCategories();
	};

	const handleViewSuccess = () => {
		setViewSheetOpen(false);
		setViewingCategory(null);
		mutateCategories();
	};

	const columns = useMemo(
		() => [
			{
				key: 'title',
				header: 'Category',
				render: (value: unknown) => <span className="text-sm font-medium">{String(value || '—')}</span>,
			},
			{
				key: 'slug',
				header: 'Slug',
				render: (value: unknown) => (
					<span className="font-mono text-sm text-muted-foreground">{value ? String(value) : '—'}</span>
				),
			},
			{
				key: 'description',
				header: 'Description',
				render: (value: unknown) => (
					<span className="max-w-xs truncate block text-sm text-muted-foreground">
						{value ? String(value) : '—'}
					</span>
				),
			},
			{
				key: 'serialNo',
				header: 'Serial',
				render: (value: unknown) => (
					<span className="text-sm font-semibold tabular-nums">{value ? String(value) : '0'}</span>
				),
			},
			{
				key: 'isActive',
				header: 'Status',
				render: (value: unknown) => (
					<Badge variant={value ? 'default' : 'secondary'} className="text-[10px] px-2 py-0.5">
						{value ? 'Active' : 'Inactive'}
					</Badge>
				),
			},
			{
				key: 'createdAt',
				header: 'Created',
				render: (value: unknown) => <span className="text-sm text-muted-foreground">{formatDate(value)}</span>,
			},
		],
		[]
	);

	const actions = useMemo(
		() => [
			{ label: <Eye className="h-4 w-4" />, onClick: (c: Category) => handleViewCategory(c), variant: 'ghost' as const, size: 'icon' as const },
			{ label: <Pencil className="h-4 w-4" />, onClick: (c: Category) => handleEditCategory(c), variant: 'outline' as const, size: 'icon' as const },
			{ label: <Trash className="h-4 w-4" />, onClick: (c: Category) => handleDeleteClick(c), variant: 'destructive' as const, size: 'icon' as const },
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
					<p className="text-muted-foreground">Failed to load categories</p>
				</CardContent>
			</Card>
		);
	}

	const isMidSize = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
	const isMobile = useMediaQuery('(max-width: 639px)');
	const sheetSide = isMobile || isMidSize ? 'bottom' : 'right';

	const hasActiveFilters = search || statusFilter !== 'all';

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
					<h1 className="text-2xl font-bold font-serif tracking-tight">Categories</h1>
					<p className="text-sm text-muted-foreground mt-1">
						{total} {total === 1 ? 'category' : 'categories'} total
					</p>
				</div>
				<Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
					<SheetTrigger asChild>
						<Button className="gap-2">
							<Plus className="h-4 w-4" />
							Add Category
						</Button>
					</SheetTrigger>
					<SheetContent side={sheetSide} className={isMobile ? 'w-full h-[90vh]' : 'sm:max-w-4xl w-full'}>
						<div className="h-full px-4 py-4">
							<CategoryForm onSuccess={handleCreateSuccess} />
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
								placeholder="Search categories..."
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
						<Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
							<SelectTrigger className="h-10 sm:w-44">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All status</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="inactive">Inactive</SelectItem>
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
										setStatusFilter('all');
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
			{!categoriesData && !error ? (
				<div className="flex items-center justify-center py-20">
					<Spinner variant="pinwheel" />
				</div>
			) : categories.length === 0 ? (
				<Card>
					<CardContent className="p-16 text-center">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
							<Package className="h-6 w-6 text-muted-foreground" />
						</div>
						<p className="text-muted-foreground">
							{hasActiveFilters ? 'No categories match your filters.' : 'No categories yet.'}
						</p>
					</CardContent>
				</Card>
			) : (
				<>
					{/* Mobile: cards */}
					<div className="grid grid-cols-1 gap-3 sm:hidden">
						{categories.map((c: Category, idx: number) => (
							<button
								key={c._id}
								onClick={() => handleViewCategory(c)}
								className="text-left rounded-lg border bg-card p-4 transition-all hover:bg-muted/30 hover:shadow-md active:scale-[0.98]"
								style={{ animation: 'fadeInUp 0.4s ease-out backwards', animationDelay: `${idx * 40}ms` }}
							>
								<div className="flex items-start justify-between gap-3 mb-3">
									<div className="min-w-0 flex-1">
										<div className="text-sm font-medium truncate">{c.title}</div>
										<div className="mt-1 text-xs text-muted-foreground truncate">{c.slug}</div>
										{c.description ? (
											<div className="mt-1 text-xs text-muted-foreground line-clamp-2">{c.description}</div>
										) : null}
									</div>

									<div className="shrink-0 text-right">
										<div className="text-sm font-semibold tabular-nums">#{c.serialNo ?? 0}</div>
										<Badge variant={c.isActive ? 'default' : 'secondary'} className="mt-1 text-[10px] px-2 py-0.5">
											{c.isActive ? 'Active' : 'Inactive'}
										</Badge>
									</div>
								</div>

								<div className="flex items-center justify-between pt-3 border-t">
									<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
										<span>{formatDate(c.createdAt)}</span>
										<span className="text-muted-foreground">•</span>
										<span>{c.isActive ? 'Published' : 'Hidden'}</span>
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
							showingCount={categories.length}
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
						<SimpleTable data={categories} columns={columns} actions={actions} showPagination={false} />

						<div className="border-t p-4">
							<ServerPagination
								page={meta?.page ?? page}
								totalPages={totalPages}
								total={total}
								limit={meta?.limit ?? limit}
								showingCount={categories.length}
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
					if (!open) setViewingCategory(null);
				}}
			>
				<SheetContent
					side={sheetSide}
					className={isMobile ? 'w-full h-[85vh]' : isMidSize ? 'sm:max-w-[600px] h-[85vh]' : 'sm:max-w-[600px] w-full'}
				>
					<div className="h-full">
						{viewingCategory && (
							<CategoryView
								category={viewingCategory}
								onEdit={handleViewToEdit}
								onDelete={handleViewToDelete}
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
					if (!open) setEditingCategory(null);
				}}
			>
				<SheetContent side={sheetSide} className={isMobile ? 'w-full h-[90vh]' : 'sm:max-w-4xl w-full'}>
					<div className="h-full">
						{editingCategory && (
							<CategoryEditForm
								category={editingCategory}
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
				title="Delete Category"
				description={`Are you sure you want to delete "${deletingCategory?.title}"? This action cannot be undone.`}
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
