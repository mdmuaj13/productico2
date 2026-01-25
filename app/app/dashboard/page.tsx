'use client';

import { useEffect, useState } from 'react';
import { SectionCards, type DashboardStats } from '@/components/section-cards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { Spinner } from '@/components/ui/shadcn-io/spinner';

type OrderStatus =
	| 'pending'
	| 'processing'
	| 'confirmed'
	| 'shipped'
	| 'delivered'
	| 'cancelled';

type OrderPaymentStatus = 'unpaid' | 'partial' | 'paid';

interface RecentOrder {
	_id: string;
	code: string;
	customerName: string;
	customerDistrict?: string;
	total: number;
	paid: number;
	due: number;
	status: OrderStatus;
	paymentStatus: OrderPaymentStatus;
	createdAt: string;
}

export default function Page() {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [orders, setOrders] = useState<RecentOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				const [statsRes, ordersRes] = await Promise.all([
					fetch('/api/dashboard/stats'),
					fetch('/api/orders?page=1&limit=5&sortBy=createdAt&sortOrder=desc'),
				]);

				if (!statsRes.ok) {
					throw new Error('Failed to fetch dashboard stats');
				}
				if (!ordersRes.ok) {
					throw new Error('Failed to fetch recent orders');
				}

				const statsData = (await statsRes.json()) as DashboardStats;
				const ordersJson = (await ordersRes.json()) as {
					data: RecentOrder[];
				};

				setStats(statsData);
				setOrders(Array.isArray(ordersJson.data) ? ordersJson.data : []);
			} catch (e) {
				setError(e instanceof Error ? e.message : 'Failed to load dashboard');
			} finally {
				setLoading(false);
			}
		};

		void load();
	}, []);

	const getStatusBadgeVariant = (status: OrderStatus) => {
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
				return 'outline';
			case 'cancelled':
				return 'destructive';
			default:
				return 'secondary';
		}
	};

	const getPaymentStatusBadgeVariant = (status: OrderPaymentStatus) => {
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
						<SectionCards stats={stats} loading={loading} />

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
									{loading ? (
										<div className="flex items-center justify-center py-10">
											<Spinner variant="pinwheel" />
										</div>
									) : error ? (
										<div className="py-6 text-sm text-destructive">{error}</div>
									) : orders.length === 0 ? (
										<div className="py-6 text-sm text-muted-foreground">
											No orders yet.
										</div>
									) : (
										<div className="overflow-x-auto">
											<table className="w-full">
												<thead>
													<tr className="border-b">
														<th className="text-left p-3 text-sm font-medium">
															Order Code
														</th>
														<th className="text-left p-3 text-sm font-medium">
															Customer
														</th>
														<th className="text-left p-3 text-sm font-medium">
															District
														</th>
														<th className="text-right p-3 text-sm font-medium">
															Total
														</th>
														<th className="text-right p-3 text-sm font-medium">
															Paid
														</th>
														<th className="text-right p-3 text-sm font-medium">
															Due
														</th>
														<th className="text-center p-3 text-sm font-medium">
															Status
														</th>
														<th className="text-center p-3 text-sm font-medium">
															Payment
														</th>
														<th className="text-left p-3 text-sm font-medium">
															Date
														</th>
														<th className="text-center p-3 text-sm font-medium">
															Action
														</th>
													</tr>
												</thead>
												<tbody>
													{orders.map((order) => (
														<tr
															key={order._id}
															className="border-b hover:bg-muted/50"
														>
															<td className="p-3 text-sm font-medium">
																{order.code}
															</td>
															<td className="p-3 text-sm">{order.customerName}</td>
															<td className="p-3 text-sm">
																{order.customerDistrict || '—'}
															</td>
															<td className="p-3 text-sm text-right font-semibold">
																৳{Number(order.total || 0).toFixed(2)}
															</td>
															<td className="p-3 text-sm text-right text-green-600">
																৳{Number(order.paid || 0).toFixed(2)}
															</td>
															<td className="p-3 text-sm text-right text-red-600">
																৳{Number(order.due || 0).toFixed(2)}
															</td>
															<td className="p-3 text-center">
																<Badge variant={getStatusBadgeVariant(order.status)}>
																	{order.status.charAt(0).toUpperCase() +
																		order.status.slice(1)}
																</Badge>
															</td>
															<td className="p-3 text-center">
																<Badge
																	variant={getPaymentStatusBadgeVariant(
																		order.paymentStatus
																	)}
																>
																	{order.paymentStatus.charAt(0).toUpperCase() +
																		order.paymentStatus.slice(1)}
																</Badge>
															</td>
															<td className="p-3 text-sm">
																{new Date(order.createdAt).toLocaleDateString()}
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
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
