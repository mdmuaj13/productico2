'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { useCategories, deleteCategory } from '@/hooks/categories';
import { CategoryForm } from './create';
import { CategoryEditForm } from './edit-form';
import { CategoryView } from './view';
import { toast } from 'sonner';
import { SimpleTable } from '@/components/simple-table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Spinner } from '../ui/shadcn-io/spinner';
import { Badge } from '@/components/ui/badge';

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

export function CategoriesList() {
	const [createSheetOpen, setCreateSheetOpen] = useState(false);
	const [editSheetOpen, setEditSheetOpen] = useState(false);
	const [viewSheetOpen, setViewSheetOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const {
		data: categoriesData,
		error,
		mutate: mutateCategories,
	} = useCategories({
		page: 1,
		limit: 10,
	});

	const categories = categoriesData?.data || [];
	const meta = categoriesData?.meta;

	console.log('Categories data:', categories);

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
		console.log('View category clicked:', category);
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

	const columns = [
		{
			key: 'title',
			header: 'Title',
		},
		{
			key: 'slug',
			header: 'Slug',
			render: (value: unknown) => (
				<span className="font-mono text-sm">
					{value ? String(value) : '-'}
				</span>
			),
		},
		{
			key: 'description',
			header: 'Description',
			render: (value: unknown) => (
				<span className="max-w-xs truncate block">
					{value ? String(value) : '-'}
				</span>
			),
		},
		{
			key: 'serialNo',
			header: 'Serial No',
			render: (value: unknown) => (
				<span className="font-mono">
					{value ? String(value) : '0'}
				</span>
			),
		},
		{
			key: 'isActive',
			header: 'Status',
			render: (value: unknown) => (
				<Badge variant={value ? 'default' : 'secondary'}>
					{value ? 'Active' : 'Inactive'}
				</Badge>
			),
		},
		{
			key: 'createdAt',
			header: 'Created',
			render: (value: unknown) => new Date(String(value)).toLocaleDateString(),
		},
	];

	const actions = [
		{
			label: 'View',
			onClick: (category: Category) => {
				handleViewCategory(category);
			},
			variant: 'secondary' as const,
		},
		{
			label: 'Edit',
			onClick: (category: Category) => handleEditCategory(category),
			variant: 'outline' as const,
		},
		{
			label: 'Delete',
			onClick: (category: Category) => handleDeleteClick(category),
			variant: 'destructive' as const,
		},
	];

	console.log('Actions:', actions);

	if (error) {
		return (
			<Card>
				<CardContent className="p-6">
					<p className="text-center text-red-500">Failed to load categories</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Categories ({meta?.total || 0})</h1>
				<div className="flex items-center gap-2">
					<Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
						<SheetTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Add Category
							</Button>
						</SheetTrigger>
						<SheetContent>
							<div className="h-full">
								<CategoryForm onSuccess={handleCreateSuccess} />
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			{/* Categories Table */}
			<Card>
				<CardContent>
					{!categoriesData && !error ? (
						<div className="flex items-center justify-center py-8">
							<Spinner variant="pinwheel" />
						</div>
					) : categories.length === 0 ? (
						<div className="flex items-center justify-center py-8">
							<p>No categories found</p>
						</div>
					) : (
						<SimpleTable
							data={categories}
							columns={columns}
							actions={actions}
							showPagination={false}
						/>
					)}
				</CardContent>
			</Card>

			{/* View Sheet */}
			<Sheet open={viewSheetOpen} onOpenChange={setViewSheetOpen}>
				<SheetContent>
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
			<Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
				<SheetContent>
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
		</div>
	);
}