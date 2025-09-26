'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { createCategory } from '@/hooks/categories';

interface FormData {
	title: string;
	description: string;
	image: string;
	serialNo: number;
	isActive: boolean;
}

interface CategoryFormProps {
	onSuccess?: () => void;
}

export function CategoryForm({ onSuccess }: CategoryFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		title: '',
		description: '',
		image: '',
		serialNo: 0,
		isActive: true,
	});

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value, type } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: type === 'number' ? Number(value) : value,
		}));
	};

	const handleCheckboxChange = (checked: boolean) => {
		setFormData((prev) => ({
			...prev,
			isActive: checked,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const submitData = {
				title: formData.title,
				description: formData.description || undefined,
				image: formData.image || undefined,
				serialNo: formData.serialNo,
				isActive: formData.isActive,
			};

			console.log('Submitting category data:', submitData);
			await createCategory(submitData);
			toast.success('Category created successfully');

			// Reset form
			setFormData({
				title: '',
				description: '',
				image: '',
				serialNo: 0,
				isActive: true,
			});

			// Call success callback
			onSuccess?.();
			router.refresh();
		} catch (error) {
			console.error('Error creating category:', error);
			toast.error(
				error instanceof Error ? error.message : 'Failed to create category'
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-full space-y-6 p-4 py-8">
			<SheetHeader className="px-0">
				<SheetTitle>Create Category</SheetTitle>
				<SheetDescription>Add a new category to your system.</SheetDescription>
			</SheetHeader>

			<form onSubmit={handleSubmit} className="flex-1 space-y-4 py-4">
				<div className="space-y-2">
					<Label htmlFor="title">Category Title *</Label>
					<Input
						id="title"
						name="title"
						placeholder="Enter category title"
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
						placeholder="Enter category description"
						value={formData.description}
						onChange={handleChange}
						rows={3}
						className="resize-none"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="image">Image URL</Label>
					<Input
						id="image"
						name="image"
						type="url"
						placeholder="Enter image URL"
						value={formData.image}
						onChange={handleChange}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="serialNo">Serial Number</Label>
					<Input
						id="serialNo"
						name="serialNo"
						type="number"
						placeholder="Enter serial number"
						value={formData.serialNo}
						onChange={handleChange}
						min={0}
					/>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="isActive"
						checked={formData.isActive}
						onCheckedChange={handleCheckboxChange}
					/>
					<Label htmlFor="isActive">Active Status</Label>
				</div>
			</form>

			<SheetFooter className="gap-2 px-0 mt-auto">
				<Button type="submit" disabled={isLoading} onClick={handleSubmit}>
					{isLoading ? 'Creating...' : 'Create Category'}
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
