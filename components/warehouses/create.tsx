'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { toast } from 'sonner';
import { createWarehouse } from '@/hooks/warehouses';

interface FormData {
	title: string;
	description: string;
	address: string;
}

interface WarehouseFormProps {
	onSuccess?: () => void;
}

export function WarehouseForm({ onSuccess }: WarehouseFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		title: '',
		description: '',
		address: '',
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
			await createWarehouse(formData);
			toast.success('Warehouse created successfully');
			// Reset form
			setFormData({
				title: '',
				description: '',
				address: '',
			});

			// Call success callback
			onSuccess?.();
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to create warehouse'
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-full space-y-6 p-4 py-8">
			<SheetHeader className="px-0">
				<SheetTitle>Create Warehouse</SheetTitle>
				<SheetDescription>
					Add a new warehouse to your inventory system.
				</SheetDescription>
			</SheetHeader>

			<form onSubmit={handleSubmit} className="flex-1 space-y-4 py-4">
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
				<SheetClose asChild>
					<Button type="button" variant="outline" disabled={isLoading}>
						Cancel
					</Button>
				</SheetClose>
				<Button type="submit" disabled={isLoading} onClick={handleSubmit}>
					{isLoading ? 'Creating...' : 'Create Warehouse'}
				</Button>
			</SheetFooter>
		</div>
	);
}
