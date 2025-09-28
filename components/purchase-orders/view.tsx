'use client';

import {
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';

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
				<SheetDescription>
					View purchase order information.
				</SheetDescription>
			</SheetHeader>

			<div className="flex-1 space-y-4 py-4">
				<div className="space-y-2">
					<Label>Title</Label>
					<div className="w-full p-3 border rounded-md bg-gray-50">
						{purchaseOrder.title}
					</div>
				</div>

				<div className="space-y-2">
					<Label>PO Date</Label>
					<div className="w-full p-3 border rounded-md bg-gray-50">
						{formatDate(purchaseOrder.po_date)}
					</div>
				</div>

				<div className="space-y-2">
					<Label>Vendor</Label>
					<div className="w-full p-3 border rounded-md bg-gray-50">
						{purchaseOrder.vendor ? purchaseOrder.vendor.name : 'No vendor'}
					</div>
				</div>

				<div className="space-y-2">
					<Label>Price</Label>
					<div className="w-full p-3 border rounded-md bg-gray-50">
						{formatPrice(purchaseOrder.price)}
					</div>
				</div>

				<div className="space-y-2">
					<Label>Status</Label>
					<div className="w-full p-3 border rounded-md bg-gray-50">
						{purchaseOrder.status.charAt(0).toUpperCase() + purchaseOrder.status.slice(1)}
					</div>
				</div>

				<div className="space-y-2">
					<Label>Order Information</Label>
					<div className="w-full p-3 border rounded-md bg-gray-50 min-h-[80px] whitespace-pre-wrap">
						{purchaseOrder.order_info || 'No order information'}
					</div>
				</div>
			</div>
		</div>
	);
}