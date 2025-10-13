'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { OrderForm } from './create';
import { OrderView } from './view';
import { OrderEditForm } from './edit-form';
import { SimpleTable } from '@/components/simple-table';
import { Badge } from '@/components/ui/badge';
import { useOrders, Order as OrderType } from '@/hooks/orders';
import { Spinner } from '@/components/ui/shadcn-io/spinner';

export function OrdersList() {
	const [createSheetOpen, setCreateSheetOpen] = useState(false);
	const [editSheetOpen, setEditSheetOpen] = useState(false);
	const [viewSheetOpen, setViewSheetOpen] = useState(false);
	const [editingOrder, setEditingOrder] = useState<OrderType | null>(null);
	const [viewingOrder, setViewingOrder] = useState<OrderType | null>(null);

	const {
		data: ordersData,
		error,
		mutate: mutateOrders,
	} = useOrders({
		page: 1,
		limit: 100,
	});

	const orders = ordersData?.data || [];
	const meta = ordersData?.meta;

	const handleViewOrder = (order: OrderType) => {
		setViewingOrder(order);
		setViewSheetOpen(true);
	};

	const handleEditOrder = (order: OrderType) => {
		setEditingOrder(order);
		setEditSheetOpen(true);
	};

	const handleViewToEdit = () => {
		if (viewingOrder) {
			setViewSheetOpen(false);
			setEditingOrder(viewingOrder);
			setEditSheetOpen(true);
		}
	};

	const handleCreateSuccess = () => {
		setCreateSheetOpen(false);
		mutateOrders();
	};

	const handleEditSuccess = () => {
		setEditSheetOpen(false);
		setEditingOrder(null);
		mutateOrders();
	};

	const handleViewSuccess = () => {
		setViewSheetOpen(false);
		setViewingOrder(null);
		mutateOrders();
	};

	const getStatusBadgeVariant = (status: OrderType['status']) => {
		switch (status) {
			case 'pending':
				return 'secondary';
			case 'processing':
				return 'default';
			case 'confirmed':
				return 'default';
			case 'shipped':
				return 'default';
			case 'delivered':
				return 'default';
			case 'cancelled':
				return 'destructive';
			default:
				return 'secondary';
		}
	};

	const getPaymentStatusBadgeVariant = (
		status: OrderType['paymentStatus']
	) => {
		switch (status) {
			case 'unpaid':
				return 'destructive';
			case 'partial':
				return 'secondary';
			case 'paid':
				return 'default';
			default:
				return 'secondary';
		}
	};

	const columns = [
		{
			key: 'code',
			header: 'Order Code',
		},
		{
			key: 'customerName',
			header: 'Customer',
		},
		{
			key: 'customerMobile',
			header: 'Contact',
		},
		{
			key: 'customerDistrict',
			header: 'District',
			render: (value: unknown) => (<span>{String(value) || 'N/A'}</span>),
		},
		{
			key: 'total',
			header: 'Amount',
			render: (value: unknown) => (
				<span className="font-semibold">৳{Number(value).toFixed(2)}</span>
			),
		},
		{
			key: 'paid',
			header: 'Paid',
			render: (value: unknown) => (
				<span className="text-green-600">৳{Number(value).toFixed(2)}</span>
			),
		},
		{
			key: 'due',
			header: 'Due',
			render: (value: unknown) => (
				<span className="text-red-600">৳{Number(value).toFixed(2)}</span>
			),
		},
		{
			key: 'status',
			header: 'Status',
			render: (value: unknown, row: OrderType) => (
				<Badge variant={getStatusBadgeVariant(row.status)}>
					{String(value).charAt(0).toUpperCase() + String(value).slice(1)}
				</Badge>
			),
		},
		{
			key: 'paymentStatus',
			header: 'Payment',
			render: (value: unknown, row: OrderType) => (
				<Badge variant={getPaymentStatusBadgeVariant(row.paymentStatus)}>
					{String(value).charAt(0).toUpperCase() + String(value).slice(1)}
				</Badge>
			),
		},
		{
			key: 'createdAt',
			header: 'Date',
			render: (value: unknown) => (<span>{new Date(String(value)).toLocaleDateString()}</span>),
		},
	];

	const actions = [
		{
			label: 'View',
			onClick: (order: OrderType) => handleViewOrder(order),
			variant: 'secondary' as const,
		},
		{
			label: 'Edit',
			onClick: (order: OrderType) => handleEditOrder(order),
			variant: 'outline' as const,
		},
	];

	if (error) {
		return (
			<Card>
				<CardContent className="p-6">
					<p className="text-center text-red-500">Failed to load orders</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Orders ({meta?.total || 0})</h1>
				<div className="flex items-center gap-2">
					<Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
						<SheetTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Create Order
							</Button>
						</SheetTrigger>
						<SheetContent className="sm:max-w-4xl w-full">
							<div className="h-full px-4 py-4">
								<OrderForm onSuccess={handleCreateSuccess} />
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			{/* Orders Table */}
			<Card>
				<CardContent>
					{!ordersData && !error ? (
						<div className="flex items-center justify-center py-8">
							<Spinner variant="pinwheel" />
						</div>
					) : orders.length === 0 ? (
						<div className="flex items-center justify-center py-8">
							<p>No orders found. Create your first order to get started.</p>
						</div>
					) : (
						<SimpleTable
							data={orders}
							columns={columns}
							actions={actions}
							showPagination={false}
						/>
					)}
				</CardContent>
			</Card>

			{/* View Sheet */}
			<Sheet open={viewSheetOpen} onOpenChange={setViewSheetOpen}>
				<SheetContent className="sm:max-w-[600px] w-full">
					<div className="h-full">
						{viewingOrder && (
							<OrderView
								order={viewingOrder}
								onEdit={handleViewToEdit}
								onSuccess={handleViewSuccess}
							/>
						)}
					</div>
				</SheetContent>
			</Sheet>

			{/* Edit Sheet */}
			<Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
				<SheetContent className="sm:max-w-[600px] w-full">
					<div className="h-full">
						{editingOrder && (
							<OrderEditForm order={editingOrder} onSuccess={handleEditSuccess} />
						)}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
