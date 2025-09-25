'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet';
import { updateVendor } from '@/hooks/vendors';
import { toast } from 'sonner';

interface Vendor {
	_id: string;
	name: string;
	contact_number: string;
	email?: string;
	address?: string;
	remarks?: string;
	createdAt: string;
	updatedAt: string;
}

interface VendorEditFormProps {
	vendor: Vendor;
	onSuccess?: () => void;
}

interface FormData {
	name: string;
	contact_number: string;
	email: string;
	address: string;
	remarks: string;
}

export function VendorEditForm({ vendor, onSuccess }: VendorEditFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		name: vendor.name,
		contact_number: vendor.contact_number,
		email: vendor.email || '',
		address: vendor.address || '',
		remarks: vendor.remarks || '',
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const submitData = {
				...formData,
				email: formData.email || undefined,
				address: formData.address || undefined,
				remarks: formData.remarks || undefined,
			};

			await updateVendor(vendor._id, submitData);
			toast.success('Vendor updated successfully');
			onSuccess?.();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to update vendor'
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-full space-y-6 p-4 py-8">
			<SheetHeader className="px-0">
				<SheetTitle>Edit Vendor</SheetTitle>
				<SheetDescription>
					Update the vendor information below.
				</SheetDescription>
			</SheetHeader>

			<form onSubmit={handleSubmit} className="flex-1 space-y-4 py-4">
				<div className="space-y-2">
					<Label htmlFor="name">Vendor Name *</Label>
					<Input
						id="name"
						name="name"
						placeholder="Enter vendor name"
						value={formData.name}
						onChange={handleChange}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="contact_number">Contact Number *</Label>
					<Input
						id="contact_number"
						name="contact_number"
						placeholder="Enter contact number"
						value={formData.contact_number}
						onChange={handleChange}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="Enter email address"
						value={formData.email}
						onChange={handleChange}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="address">Address</Label>
					<Textarea
						id="address"
						name="address"
						placeholder="Enter vendor address"
						value={formData.address}
						onChange={handleChange}
						rows={2}
						className="resize-none"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="remarks">Remarks</Label>
					<Textarea
						id="remarks"
						name="remarks"
						placeholder="Enter any remarks"
						value={formData.remarks}
						onChange={handleChange}
						rows={2}
						className="resize-none"
					/>
				</div>
			</form>

			<SheetFooter className="gap-2 px-0 mt-auto">
				<Button type="submit" disabled={isLoading} onClick={handleSubmit}>
					{isLoading ? 'Updating...' : 'Update Vendor'}
				</Button>
				<SheetClose asChild>
					<Button type="button" variant="outline" disabled={isLoading}>
						Cancel
					</Button>
				</SheetClose>
			</SheetFooter>
		</div>
	);
}
