'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { useProducts, deleteProduct } from '@/hooks/products';
import { ProductForm } from './product-form';
import { ProductEditForm } from './edit-form';
import { ProductView } from './view';
import { toast } from 'sonner';
import { SimpleTable } from '@/components/simple-table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Spinner } from '../ui/shadcn-io/spinner';


interface Product {
	_id: string;
	title: string;
	slug: string;
	thumbnail?: string;
	categoryId: {
		_id: string;
		title: string;
		slug: string;
	};
	price: number;
	salePrice?: number;
	unit: string;
	tags: string[];
	variants: Record<string, unknown>[];
	createdAt: string;
	updatedAt: string;
}

export function ProductsList() {
	const [createSheetOpen, setCreateSheetOpen] = useState(false);
	const [editSheetOpen, setEditSheetOpen] = useState(false);
	const [viewSheetOpen, setViewSheetOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const {
		data: productsData,
		error,
		mutate: mutateProducts,
	} = useProducts({
		page: 1,
		limit: 10,
	});


	const products = productsData?.data || [];
	const meta = productsData?.meta;

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

	const handleViewToDelete = () => {
		setViewSheetOpen(false);
		mutateProducts();
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

	const columns = [
		{
			key: 'title',
			header: 'Product',
		},
		{
			key: 'categoryId',
			header: 'Category',
			render: (value: unknown) => (value as Product['categoryId']).title,
		},
		{
			key: 'price',
			header: 'Price',
			render: (value: unknown) => `$${value}`,
		},
		{
			key: 'unit',
			header: 'Unit',
		},
		{
			key: 'variants',
			header: 'Variants',
			render: (value: unknown) => {
				const variants = value as Product['variants'];
				return variants && variants.length > 0 ? `${variants.length}` : '0';
			},
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
			onClick: (product: Product) => {
				handleViewProduct(product);
			},
			variant: 'secondary' as const,
		},
		{
			label: 'Edit',
			onClick: (product: Product) => handleEditProduct(product),
			variant: 'outline' as const,
		},
		{
			label: 'Delete',
			onClick: (product: Product) => handleDeleteClick(product),
			variant: 'destructive' as const,
		},
	];

	if (error) {
		return (
			<Card>
				<CardContent className="p-6">
					<p className="text-center text-red-500">Failed to load products</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Products ({meta?.total || 0})</h1>
				<div className="flex items-center gap-2">
					<Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
						<SheetTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Add Product
							</Button>
						</SheetTrigger>
						<SheetContent>
							<div className="h-full">
								<ProductForm onSuccess={handleCreateSuccess} />
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			{/* Products Table */}
			<Card>
				<CardContent>
					{!productsData && !error ? (
						<div className="flex items-center justify-center py-8">
							<Spinner variant="pinwheel" />
						</div>
					) : products.length === 0 ? (
						<div className="flex items-center justify-center py-8">
							<p>No products found</p>
						</div>
					) : (
						<SimpleTable
							data={products}
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
						{viewingProduct && (
							<ProductView
								product={viewingProduct}
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
		</div>
	);
}
