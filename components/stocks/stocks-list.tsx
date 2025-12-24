'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Plus, Minus, Pencil, Trash } from 'lucide-react';
import { useStocks, deleteStock } from '@/hooks/stocks';
import { StockForm } from './stock-form';
import { StockEditForm } from './stock-edit-form';
import { StockAdjustForm } from './stock-adjust-form';
import { toast } from 'sonner';
import { SimpleTable } from '@/components/simple-table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Spinner } from '../ui/shadcn-io/spinner';

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
	variants: Variant[];
}

interface Warehouse {
	_id: string;
	title: string;
	slug: string;
}

interface Stock {
	_id: string;
	productId: Product;
	variantName: string | null;
	warehouseId: Warehouse;
	quantity: number;
	reorderPoint?: number;
	createdAt: string;
	updatedAt: string;
}

export function StocksList() {
	const [createSheetOpen, setCreateSheetOpen] = useState(false);
	const [editSheetOpen, setEditSheetOpen] = useState(false);
	const [editingStock, setEditingStock] = useState<Stock | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingStock, setDeletingStock] = useState<Stock | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [adjustSheetOpen, setAdjustSheetOpen] = useState(false);

	const {
		data: stocksData,
		error,
		mutate: mutateStocks,
	} = useStocks({
		page: 1,
		limit: 100,
	});

	const stocks = stocksData?.data || [];
	const meta = stocksData?.meta;

	const handleDeleteClick = (stock: Stock) => {
		setDeletingStock(stock);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!deletingStock) return;

		setIsDeleting(true);
		try {
			await deleteStock(deletingStock._id);
			toast.success('Stock deleted successfully');
			mutateStocks();
		} catch {
			toast.error('Failed to delete stock');
		} finally {
			setIsDeleting(false);
			setDeleteDialogOpen(false);
			setDeletingStock(null);
		}
	};

	const handleEditStock = (stock: Stock) => {
		setEditingStock(stock);
		setEditSheetOpen(true);
	};

	const handleCreateSuccess = () => {
		setCreateSheetOpen(false);
		mutateStocks();
	};

	const handleEditSuccess = () => {
		setEditSheetOpen(false);
		setEditingStock(null);
		mutateStocks();
	};

	const handleAdjustSuccess = () => {
		setAdjustSheetOpen(false);
		mutateStocks();
	};

	const columns = [
		{
			key: 'productId',
			header: 'Product',
			render: (value: unknown) => (value as Product).title,
		},
		{
			key: 'variantName',
			header: 'Variant',
			render: (value: unknown) => {
				const variantName = value as string | null;
				return variantName || 'Base Product';
			},
		},
		{
			key: 'warehouseId',
			header: 'Warehouse',
			render: (value: unknown) => <span>{(value as Warehouse).title}</span>,
		},
		{
			key: 'quantity',
			header: 'Quantity',
			render: (value: unknown, row: Stock) => {
				const quantity = value as number;
				const reorderPoint = row.reorderPoint || 10;
				const isLowStock = quantity <= reorderPoint;

				return (
					<span className={isLowStock ? 'text-red-600 font-semibold' : ''}>
						{quantity}
						{isLowStock && ' ⚠️'}
					</span>
				);
			},
		},
		{
			key: 'reorderPoint',
			header: 'Reorder Point',
			render: (value: unknown) => <span>{(value as number) || 10}</span>,
		},
		{
			key: 'updatedAt',
			header: 'Last Updated',
			render: (value: unknown) => <span>{new Date(String(value)).toLocaleDateString()}</span>,
		},
	];

	const actions = [
		{
			label: <Pencil/>,
			onClick: (stock: Stock) => handleEditStock(stock),
			variant: 'outline' as const,
		},
		{
			label: <Trash/>,
			onClick: (stock: Stock) => handleDeleteClick(stock),
			variant: 'destructive' as const,
		},
	];

	if (error) {
		return (
			<Card>
				<CardContent className="p-6">
					<p className="text-center text-red-500">Failed to load stocks</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Stock Management ({meta?.total || 0})</h1>
				<div className="flex items-center gap-2">
					<Sheet open={adjustSheetOpen} onOpenChange={setAdjustSheetOpen}>
						<SheetTrigger asChild>
							<Button variant="outline">
								<Minus className="h-4 w-4 mr-2" />
								Adjust Stock
							</Button>
						</SheetTrigger>
						<SheetContent>
							<div className="h-full">
								<StockAdjustForm onSuccess={handleAdjustSuccess} />
							</div>
						</SheetContent>
					</Sheet>
					<Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
						<SheetTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Add Stock
							</Button>
						</SheetTrigger>
						<SheetContent>
							<div className="h-full">
								<StockForm onSuccess={handleCreateSuccess} />
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			{/* Stocks Table */}
			<Card>
				<CardContent>
					{!stocksData && !error ? (
						<div className="flex items-center justify-center py-8">
							<Spinner variant="pinwheel" />
						</div>
					) : stocks.length === 0 ? (
						<div className="flex items-center justify-center py-8">
							<p>No stocks found. Add your first stock entry to get started.</p>
						</div>
					) : (
						<SimpleTable
							data={stocks}
							columns={columns}
							actions={actions}
							showPagination={false}
						/>
					)}
				</CardContent>
			</Card>

			{/* Edit Sheet */}
			<Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
				<SheetContent>
					<div className="h-full">
						{editingStock && (
							<StockEditForm stock={editingStock} onSuccess={handleEditSuccess} />
						)}
					</div>
				</SheetContent>
			</Sheet>

			{/* Delete Confirmation Dialog */}
			<ConfirmationDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={handleDeleteConfirm}
				title="Delete Stock"
				description={`Are you sure you want to delete stock for "${deletingStock?.productId.title}"${
					deletingStock?.variantName ? ` - ${deletingStock.variantName}` : ''
				} at "${deletingStock?.warehouseId.title}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				isLoading={isDeleting}
			/>
		</div>
	);
}
