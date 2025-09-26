'use client';

import {
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, DollarSign, FileText, Package } from 'lucide-react';

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

interface PurchaseOrderViewProps {
	purchaseOrder: PurchaseOrder;
}

export function PurchaseOrderView({ purchaseOrder }: PurchaseOrderViewProps) {
	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case 'pending':
				return 'secondary';
			case 'approved':
				return 'default';
			case 'received':
				return 'default';
			case 'cancelled':
				return 'destructive';
			default:
				return 'secondary';
		}
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(price);
	};

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	return (
		<div className="flex flex-col h-full space-y-6 p-4 py-8">
			<SheetHeader className="px-0">
				<SheetTitle>Purchase Order Details</SheetTitle>
			</SheetHeader>

			<div className="flex-1 space-y-6 py-4">
				{/* Header Information */}
				<Card>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div>
								<CardTitle className="text-xl">{purchaseOrder.title}</CardTitle>
								<p className="text-sm text-muted-foreground mt-1">
									PO ID: {purchaseOrder._id.slice(-8).toUpperCase()}
								</p>
							</div>
							<Badge variant={getStatusBadgeVariant(purchaseOrder.status) as "default" | "secondary" | "destructive" | "outline"}>
								{purchaseOrder.status.charAt(0).toUpperCase() + purchaseOrder.status.slice(1)}
							</Badge>
						</div>
					</CardHeader>
				</Card>

				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<Package className="h-5 w-5" />
							Purchase Order Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-3">
							<Calendar className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">PO Date</p>
								<p className="text-sm text-muted-foreground">
									{formatDate(purchaseOrder.po_date)}
								</p>
							</div>
						</div>

						<Separator />

						<div className="flex items-center gap-3">
							<DollarSign className="h-4 w-4 text-muted-foreground" />
							<div>
								<p className="text-sm font-medium">Price</p>
								<p className="text-sm text-muted-foreground font-semibold">
									{formatPrice(purchaseOrder.price)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Vendor Information */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<User className="h-5 w-5" />
							Vendor Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						{purchaseOrder.vendor ? (
							<div className="space-y-2">
								<p className="font-medium">{purchaseOrder.vendor.name}</p>
								{purchaseOrder.vendor.email && (
									<p className="text-sm text-muted-foreground">
										{purchaseOrder.vendor.email}
									</p>
								)}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">No vendor assigned</p>
						)}
					</CardContent>
				</Card>

				{/* Order Information */}
				{purchaseOrder.order_info && (
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<FileText className="h-5 w-5" />
								Order Information
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm whitespace-pre-wrap">
								{purchaseOrder.order_info}
							</p>
						</CardContent>
					</Card>
				)}

				{/* Metadata */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Metadata</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<p className="text-sm font-medium">Created</p>
							<p className="text-sm text-muted-foreground">
								{formatDate(purchaseOrder.createdAt)}
							</p>
						</div>

						<Separator />

						<div>
							<p className="text-sm font-medium">Last Updated</p>
							<p className="text-sm text-muted-foreground">
								{formatDate(purchaseOrder.updatedAt)}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}