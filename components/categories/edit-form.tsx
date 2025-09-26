'use client';

import { useState } from 'react';
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
import { updateCategory } from '@/hooks/categories';
import { toast } from 'sonner';

interface Category {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	image?: string;
	serialNo: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface CategoryEditFormProps {
	category: Category;
	onSuccess?: () => void;
}

interface FormData {
	title: string;
	description: string;
	image: string;
	serialNo: number;
	isActive: boolean;
}

export function CategoryEditForm({ category, onSuccess }: CategoryEditFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		title: category.title,
		description: category.description || '',
		image: category.image || '',
		serialNo: category.serialNo,
		isActive: category.isActive,
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

			console.log('Updating category data:', submitData);
			await updateCategory(category._id, submitData);
			toast.success('Category updated successfully');
			onSuccess?.();
		} catch (error) {
			console.error('Error updating category:', error);
			toast.error(
				error instanceof Error ? error.message : 'Failed to update category'
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-full space-y-6 p-4 py-8">
			<SheetHeader className="px-0">
				<SheetTitle>Edit Category</SheetTitle>
				<SheetDescription>
					Update the category information below.
				</SheetDescription>
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
					{isLoading ? 'Updating...' : 'Update Category'}
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