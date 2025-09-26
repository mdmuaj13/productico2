'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet';
import { updatePurchaseOrder, useVendors } from '@/hooks/purchase-orders';
import { toast } from 'sonner';

interface Vendor {
	_id: string;
	name: string;
}

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

interface PurchaseOrderEditFormProps {
	purchaseOrder: PurchaseOrder;
	onSuccess?: () => void;
}

interface FormData {
	title: string;
	po_date: string;
	vendor_id: string;
	order_info: string;
	price: string;
	status: 'pending' | 'approved' | 'received' | 'cancelled';
}

export function PurchaseOrderEditForm({
	purchaseOrder,
	onSuccess,
}: PurchaseOrderEditFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		title: purchaseOrder.title,
		po_date: purchaseOrder.po_date.split('T')[0], // Convert to YYYY-MM-DD format
		vendor_id: purchaseOrder.vendor_id || 'none',
		order_info: purchaseOrder.order_info || '',
		price: purchaseOrder.price.toString(),
		status: purchaseOrder.status,
	});

	const { data: vendorsData } = useVendors();
	const vendors = vendorsData?.data || [];

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleDateChange = (value: string) => {
		setFormData((prev) => ({
			...prev,
			po_date: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const submitData = {
				...formData,
				price: parseFloat(formData.price) || 0,
				vendor_id: formData.vendor_id === 'none' ? undefined : formData.vendor_id || undefined,
			};

			await updatePurchaseOrder(purchaseOrder._id, submitData);
			toast.success('Purchase order updated successfully');
			onSuccess?.();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to update purchase order'
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-full space-y-6 p-4 py-8">
			<SheetHeader className="px-0">
				<SheetTitle>Edit Purchase Order</SheetTitle>
				<SheetDescription>
					Update the purchase order information below.
				</SheetDescription>
			</SheetHeader>

			<form onSubmit={handleSubmit} className="flex-1 space-y-4 py-4">
				<div className="space-y-2">
					<Label htmlFor="title">Title *</Label>
					<Input
						id="title"
						name="title"
						placeholder="Enter purchase order title"
						value={formData.title}
						onChange={handleChange}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="po_date">PO Date *</Label>
					<DatePicker
						id="po_date"
						value={formData.po_date}
						onChange={handleDateChange}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="vendor_id">Vendor</Label>
					<Select
						value={formData.vendor_id}
						onValueChange={(value) => handleSelectChange('vendor_id', value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select a vendor" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">No vendor</SelectItem>
							{vendors.map((vendor: Vendor) => (
								<SelectItem key={vendor._id} value={vendor._id}>
									{vendor.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="price">Price *</Label>
					<Input
						id="price"
						name="price"
						type="number"
						step="0.01"
						min="0"
						placeholder="Enter price"
						value={formData.price}
						onChange={handleChange}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="status">Status *</Label>
					<Select
						value={formData.status}
						onValueChange={(value) => handleSelectChange('status', value as FormData['status'])}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="approved">Approved</SelectItem>
							<SelectItem value="received">Received</SelectItem>
							<SelectItem value="cancelled">Cancelled</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="order_info">Order Information</Label>
					<Textarea
						id="order_info"
						name="order_info"
						placeholder="Enter order information"
						value={formData.order_info}
						onChange={handleChange}
						rows={3}
						className="resize-none"
					/>
				</div>
			</form>

			<SheetFooter className="gap-2 px-0 mt-auto">
				<SheetClose asChild>
					<Button type="button" variant="outline" disabled={isLoading}>
						Cancel
					</Button>
				</SheetClose>
				<Button type="submit" disabled={isLoading} onClick={handleSubmit}>
					{isLoading ? 'Updating...' : 'Update Purchase Order'}
				</Button>
			</SheetFooter>
		</div>
	);
}