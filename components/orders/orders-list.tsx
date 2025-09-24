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
import { Order } from '@/types/order';

// Mock data for demonstration
const mockOrders: Order[] = [
	{
		_id: '1',
		name: 'John Doe',
		address: '123 Main St, Apt 4B',
		city: 'Dhaka',
		contact_number: '01712345678',
		email: 'john@example.com',
		order_code: 'ORD-001',
		order_date: new Date().toISOString(),
		products: [
			{
				id: '1',
				title: 'Product A',
				slug: 'product-a',
				price: 1000,
				salePrice: 900,
				quantity: 2,
				lineTotal: 1800,
			},
		],
		order_amount: 2300,
		discount_amount: 100,
		delivery_cost: 100,
		paid_amount: 1000,
		due_amount: 1300,
		order_status: 'pending',
		order_payment_status: 'partial',
		remark: 'Urgent delivery',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
];

export function OrdersList() {
	const [createSheetOpen, setCreateSheetOpen] = useState(false);
	const [editSheetOpen, setEditSheetOpen] = useState(false);
	const [viewSheetOpen, setViewSheetOpen] = useState(false);
	const [editingOrder, setEditingOrder] = useState<Order | null>(null);
	const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

	// TODO: Replace with actual API call
	const orders = mockOrders;

	const handleViewOrder = (order: Order) => {
		setViewingOrder(order);
		setViewSheetOpen(true);
	};

	const handleEditOrder = (order: Order) => {
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
		// TODO: Refresh orders list
	};

	const handleEditSuccess = () => {
		setEditSheetOpen(false);
		setEditingOrder(null);
		// TODO: Refresh orders list
	};

	const handleViewSuccess = () => {
		setViewSheetOpen(false);
		setViewingOrder(null);
		// TODO: Refresh orders list
	};

	const getStatusBadgeVariant = (status: Order['order_status']) => {
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
		status: Order['order_payment_status']
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
			key: 'order_code',
			header: 'Order Code',
		},
		{
			key: 'name',
			header: 'Customer',
		},
		{
			key: 'contact_number',
			header: 'Contact',
		},
		{
			key: 'city',
			header: 'City',
		},
		{
			key: 'order_amount',
			header: 'Amount',
			render: (value: unknown) => (
				<span className="font-semibold">৳{Number(value).toFixed(2)}</span>
			),
		},
		{
			key: 'paid_amount',
			header: 'Paid',
			render: (value: unknown) => (
				<span className="text-green-600">৳{Number(value).toFixed(2)}</span>
			),
		},
		{
			key: 'due_amount',
			header: 'Due',
			render: (value: unknown) => (
				<span className="text-red-600">৳{Number(value).toFixed(2)}</span>
			),
		},
		{
			key: 'order_status',
			header: 'Status',
			render: (value: unknown, row: Order) => (
				<Badge variant={getStatusBadgeVariant(row.order_status)}>
					{String(value).charAt(0).toUpperCase() + String(value).slice(1)}
				</Badge>
			),
		},
		{
			key: 'order_payment_status',
			header: 'Payment',
			render: (value: unknown, row: Order) => (
				<Badge variant={getPaymentStatusBadgeVariant(row.order_payment_status)}>
					{String(value).charAt(0).toUpperCase() + String(value).slice(1)}
				</Badge>
			),
		},
		{
			key: 'order_date',
			header: 'Date',
			render: (value: unknown) => new Date(String(value)).toLocaleDateString(),
		},
	];

	const actions = [
		{
			label: 'View',
			onClick: (order: Order) => handleViewOrder(order),
			variant: 'secondary' as const,
		},
		{
			label: 'Edit',
			onClick: (order: Order) => handleEditOrder(order),
			variant: 'outline' as const,
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Orders ({orders.length})</h1>
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
					{orders.length === 0 ? (
						<div className="flex items-center justify-center py-8">
							<p>No orders found</p>
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
