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
import { updateWarehouse } from '@/hooks/warehouses';
import { toast } from 'sonner';

interface Warehouse {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	address: string;
	createdAt: string;
	updatedAt: string;
}

interface WarehouseEditFormProps {
	warehouse: Warehouse;
	onSuccess?: () => void;
}

interface FormData {
	title: string;
	description: string;
	address: string;
}

export function WarehouseEditForm({
	warehouse,
	onSuccess,
}: WarehouseEditFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		title: warehouse.title,
		description: warehouse.description || '',
		address: warehouse.address,
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
			await updateWarehouse(warehouse._id, formData);
			toast.success('Warehouse updated successfully');
			onSuccess?.();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to update warehouse'
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-full space-y-6 px-4 pt-8">
			<SheetHeader className="px-0">
				<SheetTitle>Edit Warehouse</SheetTitle>
				<SheetDescription>
					Update the warehouse information below.
				</SheetDescription>
			</SheetHeader>

			<form onSubmit={handleSubmit} className="flex-1 space-y-4 py-4 overflow-y-auto">
				<div className="space-y-2">
					<Label htmlFor="title">Warehouse Name *</Label>
					<Input
						id="title"
						name="title"
						placeholder="Enter warehouse name"
						value={formData.title}
						onChange={handleChange}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						name="description"
						placeholder="Enter warehouse description"
						value={formData.description}
						onChange={handleChange}
						rows={2}
						className="resize-none"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="address">Address *</Label>
					<Textarea
						id="address"
						name="address"
						placeholder="Enter warehouse address"
						value={formData.address}
						onChange={handleChange}
						required
						rows={2}
						className="resize-none"
					/>
				</div>
			</form>

			<SheetFooter className="gap-2 px-0 mt-auto">
				<Button type="submit" disabled={isLoading} onClick={handleSubmit}>
					{isLoading ? 'Updating...' : 'Update Warehouse'}
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
