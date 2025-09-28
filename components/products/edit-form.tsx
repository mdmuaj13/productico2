'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet';
import { updateProduct } from '@/hooks/products';
import { toast } from 'sonner';
import { useApi } from '@/lib/api';

interface Product {
	_id: string;
	title: string;
	slug: string;
	thumbnail?: string;
	categoryId: {
		_id: string;
		title: string;
		slug: string;
	};
	price: number;
	salePrice?: number;
	unit: string;
	tags: string[];
	variants: Record<string, unknown>[];
	createdAt: string;
	updatedAt: string;
}

interface Category {
	_id: string;
	name: string;
	slug: string;
}

interface ProductEditFormProps {
	product: Product;
	onSuccess?: () => void;
}

interface FormData {
	title: string;
	price: number;
	salePrice?: number;
	unit: string;
	categoryId: string;
}

export function ProductEditForm({
	product,
	onSuccess,
}: ProductEditFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		title: product.title,
		price: product.price,
		salePrice: product.salePrice,
		unit: product.unit,
		categoryId: product.categoryId._id,
	});

	const { data: categoriesData } = useApi('/api/categories');
	const categories = categoriesData?.data || [];

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === 'price' || name === 'salePrice' ? Number(value) : value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await updateProduct(product._id, formData);
			toast.success('Product updated successfully');
			onSuccess?.();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to update product'
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-full space-y-6 p-4 py-8">
			<SheetHeader className="px-0">
				<SheetTitle>Edit Product</SheetTitle>
				<SheetDescription>
					Update the product information below.
				</SheetDescription>
			</SheetHeader>

			<form onSubmit={handleSubmit} className="flex-1 space-y-4 py-4">
				<div className="space-y-2">
					<Label htmlFor="title">Product Name *</Label>
					<Input
						id="title"
						name="title"
						placeholder="Enter product name"
						value={formData.title}
						onChange={handleChange}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="categoryId">Category *</Label>
					<Select
						value={formData.categoryId}
						onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select category" />
						</SelectTrigger>
						<SelectContent>
							{categories.map((category: Category) => (
								<SelectItem key={category._id} value={category._id}>
									{category.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="price">Price *</Label>
						<Input
							id="price"
							name="price"
							type="number"
							placeholder="Enter price"
							value={formData.price}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="salePrice">Sale Price</Label>
						<Input
							id="salePrice"
							name="salePrice"
							type="number"
							placeholder="Enter sale price"
							value={formData.salePrice || ''}
							onChange={handleChange}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="unit">Unit *</Label>
					<Input
						id="unit"
						name="unit"
						placeholder="Enter unit (e.g., piece, kg, liter)"
						value={formData.unit}
						onChange={handleChange}
						required
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
					{isLoading ? 'Updating...' : 'Update Product'}
				</Button>
			</SheetFooter>
		</div>
	);
}