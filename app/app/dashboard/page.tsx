'use client';

import { useEffect, useState } from 'react';
import { SectionCards, type DashboardStats } from '@/components/section-cards';
import { Badge } from '@/components/ui/badge';
import { Eye, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { Button } from '@/components/ui/button';

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

export default function DashboardPage() {
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
		<div className="flex-1 space-y-4 p-4 pt-6 lg:p-6">
			<SectionCards stats={stats} loading={loading} />

			{/* Recent Orders */}
			<div className="rounded-lg border bg-card">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 pb-4">
					<div>
						<h2 className="text-2xl font-bold font-serif tracking-tight"
							style={{ fontFamily: "'Instrument Serif', serif" }}>
							Recent Orders
						</h2>
						<p className="text-sm text-muted-foreground mt-1">
							Latest customer transactions
						</p>
					</div>
					<Link href="/app/orders">
						<Button variant="outline" size="sm" className="group gap-2">
							View all
							<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
						</Button>
					</Link>
				</div>

				{loading ? (
					<div className="flex items-center justify-center py-16">
						<Spinner variant="pinwheel" />
					</div>
				) : error ? (
					<div className="py-10 text-center text-sm text-destructive">
						{error}
					</div>
				) : orders.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
							<Clock className="h-5 w-5 text-muted-foreground" />
						</div>
						<p className="text-muted-foreground text-sm">No orders yet.</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b bg-muted/40">
									{[
										'Order Code',
										'Customer',
										'District',
										'Total',
										'Paid',
										'Due',
										'Status',
										'Payment',
										'Date',
										''
									].map((header, i) => (
										<th
											key={i}
											className="p-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
										>
											{header}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{orders.map((order, idx) => (
									<tr
										key={order._id}
										className="border-b transition-colors hover:bg-muted/30"
										style={{ animation: 'fadeInUp 0.4s ease-out backwards', animationDelay: `${idx * 50}ms` }}
									>
										<td className="p-3">
											<code className="text-sm font-medium bg-muted px-1.5 py-0.5 rounded">
												{order.code}
											</code>
										</td>
										<td className="p-3 text-sm">{order.customerName}</td>
										<td className="p-3 text-sm text-muted-foreground">
											{order.customerDistrict || '—'}
										</td>
										<td className="p-3 text-sm text-right font-medium tabular-nums">
											৳{Number(order.total || 0).toFixed(2)}
										</td>
										<td className="p-3 text-sm text-right font-medium text-green-600 tabular-nums">
											৳{Number(order.paid || 0).toFixed(2)}
										</td>
										<td className="p-3 text-sm text-right font-medium text-red-600 tabular-nums">
											৳{Number(order.due || 0).toFixed(2)}
										</td>
										<td className="p-3 text-center">
											<Badge
												variant={getStatusBadgeVariant(order.status)}
												className="text-xs"
											>
												{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
											</Badge>
										</td>
										<td className="p-3 text-center">
											<Badge
												variant={getPaymentStatusBadgeVariant(order.paymentStatus)}
												className="text-xs"
											>
												{order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
											</Badge>
										</td>
										<td className="p-3 text-sm text-muted-foreground">
											{new Date(order.createdAt).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
												year: 'numeric'
											})}
										</td>
										<td className="p-3 text-center">
											<Link href={`/app/orders/${order._id}`}>
												<Button variant="ghost" size="icon" className="h-8 w-8">
													<Eye className="h-3.5 w-3.5" />
												</Button>
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			<style jsx global>{`
				@keyframes fadeInUp {
					from {
						opacity: 0;
						transform: translateY(8px);
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
