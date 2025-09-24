'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/types/order';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Edit, Package } from 'lucide-react';

interface OrderViewProps {
	order: Order;
	onEdit: () => void;
	onSuccess: () => void;
}

export function OrderView({ order, onEdit }: OrderViewProps) {
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
		<div className="h-full overflow-y-auto">
			<SheetHeader className="mb-6">
				<div className="flex items-start justify-between">
					<div>
						<SheetTitle>Order Details</SheetTitle>
						<p className="text-sm text-muted-foreground mt-1">
							{order.order_code}
						</p>
					</div>
					<Button onClick={onEdit} size="sm" variant="outline">
						<Edit className="h-4 w-4 mr-2" />
						Edit
					</Button>
				</div>
			</SheetHeader>

			<div className="space-y-6">
				{/* Status Badges */}
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div>
								<p className="text-sm text-muted-foreground mb-1">
									Order Status
								</p>
								<Badge variant={getStatusBadgeVariant(order.order_status)}>
									{order.order_status.charAt(0).toUpperCase() +
										order.order_status.slice(1)}
								</Badge>
							</div>
							<Separator orientation="vertical" className="h-12" />
							<div>
								<p className="text-sm text-muted-foreground mb-1">
									Payment Status
								</p>
								<Badge
									variant={getPaymentStatusBadgeVariant(
										order.order_payment_status
									)}
								>
									{order.order_payment_status.charAt(0).toUpperCase() +
										order.order_payment_status.slice(1)}
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Customer Information */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Customer Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
							<div>
								<p className="text-muted-foreground">Name</p>
								<p className="font-medium">{order.name}</p>
							</div>
							<div>
								<p className="text-muted-foreground">Contact</p>
								<p className="font-medium">{order.contact_number}</p>
							</div>
							{order.email && (
								<div className="col-span-2">
									<p className="text-muted-foreground">Email</p>
									<p className="font-medium">{order.email}</p>
								</div>
							)}
							<div className="col-span-2">
								<p className="text-muted-foreground">Address</p>
								<p className="font-medium">{order.address}</p>
							</div>
							<div>
								<p className="text-muted-foreground">City</p>
								<p className="font-medium">{order.city}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Products */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg flex items-center">
							<Package className="h-5 w-5 mr-2" />
							Products ({order.products.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{order.products.map((product, index) => (
								<div
									key={product.id}
									className={`pb-4 ${
										index !== order.products.length - 1 ? 'border-b' : ''
									}`}
								>
									<div className="flex justify-between items-start mb-2">
										<div>
											<p className="font-medium">{product.title}</p>
											{product.slug && (
												<p className="text-sm text-muted-foreground">
													{product.slug}
												</p>
											)}
										</div>
										<p className="font-semibold">৳{product.lineTotal.toFixed(2)}</p>
									</div>
									<div className="grid grid-cols-3 gap-2 text-sm">
										<div>
											<p className="text-muted-foreground">Price</p>
											<p>৳{product.price.toFixed(2)}</p>
										</div>
										{product.salePrice && product.salePrice > 0 && (
											<div>
												<p className="text-muted-foreground">Sale Price</p>
												<p className="text-green-600">
													৳{product.salePrice.toFixed(2)}
												</p>
											</div>
										)}
										<div>
											<p className="text-muted-foreground">Quantity</p>
											<p>{product.quantity}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Financial Summary */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Financial Summary</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Subtotal</span>
								<span>
									৳
									{order.products
										.reduce((sum, p) => sum + p.lineTotal, 0)
										.toFixed(2)}
								</span>
							</div>

							{order.discount_amount > 0 && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										Discount
										{order.discount_code && ` (${order.discount_code})`}
									</span>
									<span className="text-green-600">
										-৳{order.discount_amount.toFixed(2)}
									</span>
								</div>
							)}

							{order.delivery_cost > 0 && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Delivery Cost</span>
									<span>+৳{order.delivery_cost.toFixed(2)}</span>
								</div>
							)}

							<Separator />

							<div className="flex justify-between font-semibold">
								<span>Order Amount</span>
								<span>৳{order.order_amount.toFixed(2)}</span>
							</div>

							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Paid Amount</span>
								<span className="text-green-600 font-medium">
									৳{order.paid_amount.toFixed(2)}
								</span>
							</div>

							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Due Amount</span>
								<span className="text-red-600 font-medium">
									৳{order.due_amount.toFixed(2)}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Order Information */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Order Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
							<div>
								<p className="text-muted-foreground">Order Date</p>
								<p className="font-medium">
									{new Date(order.order_date).toLocaleDateString()}
								</p>
							</div>
							{order.createdAt && (
								<div>
									<p className="text-muted-foreground">Created At</p>
									<p className="font-medium">
										{new Date(order.createdAt).toLocaleString()}
									</p>
								</div>
							)}
						</div>

						{order.remark && (
							<div className="pt-2">
								<p className="text-muted-foreground text-sm mb-1">Remark</p>
								<p className="text-sm">{order.remark}</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
