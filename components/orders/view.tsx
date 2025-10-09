'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/hooks/orders';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Edit, Package, User, MapPin, Phone, Mail } from 'lucide-react';

interface OrderViewProps {
	order: Order;
	onEdit: () => void;
	onSuccess: () => void;
}

export function OrderView({ order, onEdit }: OrderViewProps) {
	const getStatusBadgeVariant = (status: Order['status']) => {
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
		status: Order['paymentStatus']
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
		<div className="h-full overflow-y-auto pb-6">
			<SheetHeader className="mb-6">
				<div className="flex items-start justify-between">
					<div>
						<SheetTitle className="text-2xl">Order Details</SheetTitle>
						<p className="text-sm text-muted-foreground mt-1 font-mono">
							{order.code}
						</p>
					</div>
					<Button onClick={onEdit} size="sm" variant="outline">
						<Edit className="h-4 w-4 mr-2" />
						Edit
					</Button>
				</div>
			</SheetHeader>

			<div className="space-y-4">
				{/* Status Badges */}
				<Card className="border-l-4 border-l-primary">
					<CardContent className="pt-4">
						<div className="flex items-center gap-4">
							<div>
								<p className="text-xs text-muted-foreground mb-1">
									Order Status
								</p>
								<Badge variant={getStatusBadgeVariant(order.status)} className="text-sm">
									{order.status.charAt(0).toUpperCase() +
										order.status.slice(1)}
								</Badge>
							</div>
							<Separator orientation="vertical" className="h-10" />
							<div>
								<p className="text-xs text-muted-foreground mb-1">
									Payment Status
								</p>
								<Badge
									variant={getPaymentStatusBadgeVariant(
										order.paymentStatus
									)}
									className="text-sm"
								>
									{order.paymentStatus.charAt(0).toUpperCase() +
										order.paymentStatus.slice(1)}
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Customer Information */}
				<Card className="border-l-4 border-l-blue-500">
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<User className="h-4 w-4" />
							Customer Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="space-y-2">
							<div className="flex items-start gap-2">
								<User className="h-4 w-4 text-muted-foreground mt-0.5" />
								<div className="flex-1">
									<p className="text-xs text-muted-foreground">Name</p>
									<p className="text-sm font-medium">{order.customerName}</p>
								</div>
							</div>
							<div className="flex items-start gap-2">
								<Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
								<div className="flex-1">
									<p className="text-xs text-muted-foreground">Contact</p>
									<p className="text-sm font-medium">{order.customerMobile}</p>
								</div>
							</div>
							{order.customerEmail && (
								<div className="flex items-start gap-2">
									<Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
									<div className="flex-1">
										<p className="text-xs text-muted-foreground">Email</p>
										<p className="text-sm font-medium">{order.customerEmail}</p>
									</div>
								</div>
							)}
							<div className="flex items-start gap-2">
								<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
								<div className="flex-1">
									<p className="text-xs text-muted-foreground">Address</p>
									<p className="text-sm font-medium">{order.customerAddress}</p>
									{order.customerDistrict && (
										<p className="text-xs text-muted-foreground mt-1">
											{order.customerDistrict}
										</p>
									)}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Products */}
				<Card className="border-l-4 border-l-green-500">
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<Package className="h-4 w-4" />
							Products ({order.products.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{order.products.map((product, index) => (
								<div
									key={index}
									className={`pb-3 ${
										index !== order.products.length - 1 ? 'border-b' : ''
									}`}
								>
									<div className="flex justify-between items-start mb-2">
										<div className="flex-1">
											<p className="font-medium text-sm">{product.title}</p>
											{product.variantName && (
												<Badge variant="secondary" className="text-xs mt-1">
													{product.variantName}
												</Badge>
											)}
										</div>
										<p className="font-semibold text-sm">৳{product.lineTotal.toFixed(2)}</p>
									</div>
									<div className="grid grid-cols-3 gap-2 text-xs">
										<div>
											<p className="text-muted-foreground">Price</p>
											<p className="font-medium">৳{product.price.toFixed(2)}</p>
										</div>
										<div>
											<p className="text-muted-foreground">Quantity</p>
											<p className="font-medium">{product.quantity}</p>
										</div>
										<div>
											<p className="text-muted-foreground">Line Total</p>
											<p className="font-medium">৳{product.lineTotal.toFixed(2)}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Financial Summary */}
				<Card className="border-l-4 border-l-amber-500">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Financial Summary</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Subtotal</span>
								<span>৳{order.subTotal.toFixed(2)}</span>
							</div>

							{order.discount > 0 && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Discount</span>
									<span className="text-green-600">
										-৳{order.discount.toFixed(2)}
									</span>
								</div>
							)}

							{order.deliveryCost > 0 && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Delivery Cost</span>
									<span>+৳{order.deliveryCost.toFixed(2)}</span>
								</div>
							)}

							{order.tax > 0 && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Tax</span>
									<span>+৳{order.tax.toFixed(2)}</span>
								</div>
							)}

							<Separator />

							<div className="flex justify-between font-semibold bg-accent/50 px-3 py-2 rounded-md">
								<span>Total Amount</span>
								<span className="text-primary">৳{order.total.toFixed(2)}</span>
							</div>

							<Separator />

							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Paid Amount</span>
								<span className="text-green-600 font-semibold">
									৳{order.paid.toFixed(2)}
								</span>
							</div>

							<div className="flex justify-between text-sm">
								<span className="font-medium">Due Amount</span>
								<span className={order.due > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
									৳{order.due.toFixed(2)}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Order Information */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Order Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="grid grid-cols-2 gap-3 text-sm">
							<div>
								<p className="text-xs text-muted-foreground">Payment Type</p>
								<p className="font-medium capitalize">{order.paymentType}</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Created At</p>
								<p className="font-medium">
									{new Date(order.createdAt).toLocaleString()}
								</p>
							</div>
							{order.trackingCode && (
								<div className="col-span-2">
									<p className="text-xs text-muted-foreground">Tracking Code</p>
									<p className="font-medium font-mono">{order.trackingCode}</p>
								</div>
							)}
						</div>

						{order.remark && (
							<div className="pt-2 border-t">
								<p className="text-xs text-muted-foreground mb-1">Remark</p>
								<p className="text-sm bg-accent/50 p-2 rounded-md">{order.remark}</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
