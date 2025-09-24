'use client';

import { SectionCards } from '@/components/section-cards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Order } from '@/types/order';
import { Eye } from 'lucide-react';
import Link from 'next/link';

// Mock data - Replace with API call
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
				price: 1000,
				quantity: 2,
				lineTotal: 2000,
			},
		],
		order_amount: 2300,
		discount_amount: 100,
		delivery_cost: 100,
		paid_amount: 1000,
		due_amount: 1300,
		order_status: 'pending',
		order_payment_status: 'partial',
	},
	{
		_id: '2',
		name: 'Jane Smith',
		address: '456 Oak Ave',
		city: 'Chittagong',
		contact_number: '01798765432',
		email: 'jane@example.com',
		order_code: 'ORD-002',
		order_date: new Date(Date.now() - 86400000).toISOString(),
		products: [
			{
				id: '2',
				title: 'Product B',
				price: 1500,
				quantity: 1,
				lineTotal: 1500,
			},
		],
		order_amount: 1650,
		discount_amount: 50,
		delivery_cost: 150,
		paid_amount: 1650,
		due_amount: 0,
		order_status: 'confirmed',
		order_payment_status: 'paid',
	},
	{
		_id: '3',
		name: 'Ahmed Rahman',
		address: '789 Park Road',
		city: 'Sylhet',
		contact_number: '01611223344',
		order_code: 'ORD-003',
		order_date: new Date(Date.now() - 172800000).toISOString(),
		products: [
			{
				id: '3',
				title: 'Product C',
				price: 800,
				quantity: 3,
				lineTotal: 2400,
			},
		],
		order_amount: 2600,
		discount_amount: 0,
		delivery_cost: 200,
		paid_amount: 0,
		due_amount: 2600,
		order_status: 'processing',
		order_payment_status: 'unpaid',
	},
	{
		_id: '4',
		name: 'Sarah Khan',
		address: '321 Lake View',
		city: 'Dhaka',
		contact_number: '01755443322',
		email: 'sarah@example.com',
		order_code: 'ORD-004',
		order_date: new Date(Date.now() - 259200000).toISOString(),
		products: [
			{
				id: '4',
				title: 'Product D',
				price: 2000,
				quantity: 1,
				lineTotal: 2000,
			},
		],
		order_amount: 2100,
		discount_amount: 0,
		delivery_cost: 100,
		paid_amount: 2100,
		due_amount: 0,
		order_status: 'delivered',
		order_payment_status: 'paid',
	},
	{
		_id: '5',
		name: 'Michael Brown',
		address: '654 River Street',
		city: 'Rajshahi',
		contact_number: '01822334455',
		order_code: 'ORD-005',
		order_date: new Date(Date.now() - 345600000).toISOString(),
		products: [
			{
				id: '5',
				title: 'Product E',
				price: 1200,
				quantity: 2,
				lineTotal: 2400,
			},
		],
		order_amount: 2650,
		discount_amount: 150,
		delivery_cost: 100,
		paid_amount: 1500,
		due_amount: 1150,
		order_status: 'shipped',
		order_payment_status: 'partial',
	},
];

export default function Page() {
	const orders = mockOrders;

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

	return (
		<div>
			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
						<SectionCards />

						<div className="px-4 lg:px-6">
							<Card>
								<CardHeader className="flex flex-row items-center justify-between">
									<CardTitle>Recent Orders</CardTitle>
									<Link href="/app/orders">
										<Button variant="outline" size="sm">
											View All
										</Button>
									</Link>
								</CardHeader>
								<CardContent>
									<div className="overflow-x-auto">
										<table className="w-full">
											<thead>
												<tr className="border-b">
													<th className="text-left p-3 text-sm font-medium">Order Code</th>
													<th className="text-left p-3 text-sm font-medium">Customer</th>
													<th className="text-left p-3 text-sm font-medium">City</th>
													<th className="text-right p-3 text-sm font-medium">Amount</th>
													<th className="text-right p-3 text-sm font-medium">Paid</th>
													<th className="text-right p-3 text-sm font-medium">Due</th>
													<th className="text-center p-3 text-sm font-medium">Status</th>
													<th className="text-center p-3 text-sm font-medium">Payment</th>
													<th className="text-left p-3 text-sm font-medium">Date</th>
													<th className="text-center p-3 text-sm font-medium">Action</th>
												</tr>
											</thead>
											<tbody>
												{orders.map((order) => (
													<tr key={order._id} className="border-b hover:bg-muted/50">
														<td className="p-3 text-sm font-medium">{order.order_code}</td>
														<td className="p-3 text-sm">{order.name}</td>
														<td className="p-3 text-sm">{order.city}</td>
														<td className="p-3 text-sm text-right font-semibold">
															৳{order.order_amount.toFixed(2)}
														</td>
														<td className="p-3 text-sm text-right text-green-600">
															৳{order.paid_amount.toFixed(2)}
														</td>
														<td className="p-3 text-sm text-right text-red-600">
															৳{order.due_amount.toFixed(2)}
														</td>
														<td className="p-3 text-center">
															<Badge variant={getStatusBadgeVariant(order.order_status)}>
																{order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
															</Badge>
														</td>
														<td className="p-3 text-center">
															<Badge variant={getPaymentStatusBadgeVariant(order.order_payment_status)}>
																{order.order_payment_status.charAt(0).toUpperCase() + order.order_payment_status.slice(1)}
															</Badge>
														</td>
														<td className="p-3 text-sm">
															{new Date(order.order_date).toLocaleDateString()}
														</td>
														<td className="p-3 text-center">
															<Link href="/app/orders">
																<Button variant="ghost" size="sm">
																	<Eye className="h-4 w-4" />
																</Button>
															</Link>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
