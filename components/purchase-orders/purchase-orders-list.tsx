'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Plus, Search, Eye, Pencil, Trash } from 'lucide-react';
import { usePurchaseOrders, deletePurchaseOrder } from '@/hooks/purchase-orders';
import { PurchaseOrderForm } from './create';
import { PurchaseOrderEditForm } from './edit-form';
import { PurchaseOrderView } from './view';
import { toast } from 'sonner';
import { SimpleTable } from '@/components/simple-table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Spinner } from '../ui/shadcn-io/spinner';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Badge } from '../ui/badge';

interface PurchaseOrder {
	_id: string;
	title: string;
	po_date: string;
	vendor_id?: string;
	vendor?: {
		_id: string;
		name: string;
		email?: string;
	};
	order_info?: string;
	price: number;
	status: 'pending' | 'approved' | 'received' | 'cancelled';
	createdAt: string;
	updatedAt: string;
}

export function PurchaseOrdersList() {
	const [createSheetOpen, setCreateSheetOpen] = useState(false);
	const [editSheetOpen, setEditSheetOpen] = useState(false);
	const [viewSheetOpen, setViewSheetOpen] = useState(false);
	const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(
		null
	);
	const [viewingPurchaseOrder, setViewingPurchaseOrder] = useState<PurchaseOrder | null>(
		null
	);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingPurchaseOrder, setDeletingPurchaseOrder] = useState<PurchaseOrder | null>(
		null
	);
	const [isDeleting, setIsDeleting] = useState(false);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');

	const {
		data: purchaseOrdersData,
		error,
		mutate: mutatePurchaseOrders,
	} = usePurchaseOrders({
		page: 1,
		limit: 10,
		search,
		status: statusFilter === 'all' ? undefined : statusFilter,
	});

	const purchaseOrders = purchaseOrdersData?.data || [];
	const meta = purchaseOrdersData?.meta;

	const handleDeleteClick = (purchaseOrder: PurchaseOrder) => {
		setDeletingPurchaseOrder(purchaseOrder);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!deletingPurchaseOrder) return;

		setIsDeleting(true);
		try {
			await deletePurchaseOrder(deletingPurchaseOrder._id);
			toast.success('Purchase order deleted successfully');
			mutatePurchaseOrders();
		} catch {
			toast.error('Failed to delete purchase order');
		} finally {
			setIsDeleting(false);
			setDeleteDialogOpen(false);
			setDeletingPurchaseOrder(null);
		}
	};

	const handleEditPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
		setEditingPurchaseOrder(purchaseOrder);
		setEditSheetOpen(true);
	};

	const handleViewPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
		setViewingPurchaseOrder(purchaseOrder);
		setViewSheetOpen(true);
	};

	const handleCreateSuccess = () => {
		setCreateSheetOpen(false);
		mutatePurchaseOrders();
	};

	const handleEditSuccess = () => {
		setEditSheetOpen(false);
		setEditingPurchaseOrder(null);
		mutatePurchaseOrders();
	};

	const handleSearch = () => {
		setSearch(searchTerm);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	const getStatusBadgeColor = (status: string) => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'approved':
				return 'bg-blue-100 text-blue-800';
			case 'received':
				return 'bg-green-100 text-green-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "pending":
				return "secondary";
			case "cancelled":
				return "destructive";
			case "approved":
				return "default";
			case "received":
				return "destructive";
			default:
				return "default";
		}
	  };

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(price);
	};

	const columns = [
		{
			key: 'title',
			header: 'Title',
		},
		{
			key: 'po_date',
			header: 'PO Date',
			render: (value: unknown) => new Date(String(value)).toLocaleDateString(),
		},
		{
			key: 'vendor',
			header: 'Vendor',
			render: (_: unknown, row: PurchaseOrder) => (
				<span className="max-w-xs truncate block">
					{row.vendor?.name || 'No vendor'}
				</span>
			),
		},
		{
			key: 'price',
			header: 'Price',
			render: (value: unknown) => formatPrice(Number(value)),
		},
		{
			key: 'status',
			header: 'Status',
			render: (value: unknown) => (
				<Badge variant={getStatusBadgeVariant(String(value))}>
				{String(value).charAt(0).toUpperCase() + String(value).slice(1)}
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
			label: <Eye/>,
			onClick: (purchaseOrder: PurchaseOrder) => handleViewPurchaseOrder(purchaseOrder),
			variant: 'outline' as const,
			icon: Eye,
		},
		{
			label: <Pencil/>,
			onClick: (purchaseOrder: PurchaseOrder) => handleEditPurchaseOrder(purchaseOrder),
			variant: 'outline' as const,
		},
		{
			label: <Trash/>,
			onClick: (purchaseOrder: PurchaseOrder) => handleDeleteClick(purchaseOrder),
			variant: 'destructive' as const,
		},
	];

	if (error) {
		return (
			<Card>
				<CardContent className="p-6">
					<p className="text-center text-red-500">Failed to load purchase orders</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Purchase Orders ({meta?.total || 0})</h1>
				<div className="flex items-center gap-2">
					<Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
						<SheetTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Add Purchase Order
							</Button>
						</SheetTrigger>
						<SheetContent>
							<div className="h-full">
								<PurchaseOrderForm onSuccess={handleCreateSuccess} />
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			{/* Purchase Orders Table */}
			<div className="space-y-4">
				<div className="flex gap-4 items-center">
					<div className="flex-1">
						<div className="relative">
							<Input
								placeholder="Search purchase orders..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onKeyDown={handleKeyDown}
								className="pr-10"
							/>
							<button
								onClick={handleSearch}
								className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
							>
								<Search className="h-4 w-4" />
							</button>
						</div>
					</div>
					<div className="w-48">
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger>
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All statuses</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="approved">Approved</SelectItem>
								<SelectItem value="received">Received</SelectItem>
								<SelectItem value="cancelled">Cancelled</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				{!purchaseOrdersData && !error ? (
					<div className="flex items-center justify-center py-8">
						<Spinner variant="pinwheel" />
					</div>
				) : purchaseOrders.length === 0 ? (
					<div className="flex items-center justify-center py-8">
						<p>No purchase orders found</p>
					</div>
				) : (
					<SimpleTable
						data={purchaseOrders}
						columns={columns}
						actions={actions}
						showPagination={false}
					/>
				)}
			</div>

			{/* View Sheet */}
			<Sheet open={viewSheetOpen} onOpenChange={setViewSheetOpen}>
				<SheetContent>
					<div className="h-full">
						{viewingPurchaseOrder && (
							<PurchaseOrderView
								purchaseOrder={viewingPurchaseOrder}
							/>
						)}
					</div>
				</SheetContent>
			</Sheet>

			{/* Edit Sheet */}
			<Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
				<SheetContent>
					<div className="h-full">
						{editingPurchaseOrder && (
							<PurchaseOrderEditForm
								purchaseOrder={editingPurchaseOrder}
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
				title="Delete Purchase Order"
				description={`Are you sure you want to delete "${deletingPurchaseOrder?.title}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				isLoading={isDeleting}
			/>
		</div>
	);
}