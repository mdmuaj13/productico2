'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	SheetHeader,
	SheetTitle,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet';
import { Plus, X, Pencil } from 'lucide-react';
import { updateProduct } from '@/hooks/products';
import { toast } from 'sonner';
import { useApi } from '@/lib/api';
import slugify from 'slugify';

interface Product {
	_id: string;
	title: string;
	slug: string;
	thumbnail?: string;
	description?: string;
	shortDetail?: string;
	categoryId: {
		_id: string;
		title: string;
		slug: string;
	};
	price: number;
	salePrice?: number;
	unit: string;
	tags: string[];
	variants: Variant[];
	createdAt: string;
	updatedAt: string;
}

interface Category {
	_id: string;
	title: string;
	slug: string;
}

interface Variant {
	name: string;
	price: number;
	salePrice?: number;
}

interface ProductEditFormProps {
	product: Product;
	onSuccess?: () => void;
}

interface FormData {
	title: string;
	slug: string;
	description: string;
	shortDetail: string;
	price: number;
	salePrice?: number;
	unit: string;
	categoryId: string;
	variants: Variant[];
}

export function ProductEditForm({
	product,
	onSuccess,
}: ProductEditFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		title: product.title,
		slug: product.slug,
		description: product.description || '',
		shortDetail: product.shortDetail || '',
		price: product.price,
		salePrice: product.salePrice,
		unit: product.unit,
		categoryId: product.categoryId._id,
		variants: product.variants || [],
	});

	const [newVariant, setNewVariant] = useState<Variant>({ name: '', price: 0 });
	const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);

	const { data: categoriesData } = useApi('/api/categories');
	const categories = categoriesData?.data || [];

	useEffect(() => {
		if (formData.title) {
			setFormData(prev => ({
				...prev,
				slug: slugify(prev.title, { lower: true, strict: true })
			}))
		}
	}, [formData.title])

	const addVariant = () => {
		if (newVariant.name.trim() && newVariant.price > 0) {
			if (editingVariantIndex !== null) {
				// Update existing variant
				setFormData(prev => ({
					...prev,
					variants: prev.variants.map((v, i) => i === editingVariantIndex ? { ...newVariant } : v)
				}))
				setEditingVariantIndex(null)
			} else {
				// Add new variant
				setFormData(prev => ({
					...prev,
					variants: [...prev.variants, { ...newVariant }]
				}))
			}
			setNewVariant({ name: '', price: 0 })
		}
	}

	const editVariant = (index: number) => {
		setNewVariant({ ...formData.variants[index] })
		setEditingVariantIndex(index)
	}

	const cancelEditVariant = () => {
		setNewVariant({ name: '', price: 0 })
		setEditingVariantIndex(null)
	}

	const removeVariant = (index: number) => {
		setFormData(prev => ({
			...prev,
			variants: prev.variants.filter((_, i) => i !== index)
		}))
		if (editingVariantIndex === index) {
			cancelEditVariant()
		}
	}

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
		<div className="flex flex-col h-full">
			<SheetHeader className="px-4 pb-4">
				<SheetTitle>Edit Product</SheetTitle>
			</SheetHeader>

			<form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
				<div className="space-y-2">
					<Label htmlFor="title">Title *</Label>
					<Input
						id="title"
						value={formData.title}
						onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="slug">Slug *</Label>
					<Input
						id="slug"
						value={formData.slug}
						onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="categoryId">Category *</Label>
					<Select
						value={formData.categoryId}
						onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select category" />
						</SelectTrigger>
						<SelectContent>
							{categories.map((category: Category) => (
								<SelectItem key={category._id} value={category._id}>
									{category.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="shortDetail">Short Detail</Label>
					<Textarea
						id="shortDetail"
						value={formData.shortDetail}
						onChange={(e) => setFormData(prev => ({ ...prev, shortDetail: e.target.value }))}
						rows={3}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						value={formData.description}
						onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
						rows={4}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="price">Price *</Label>
						<Input
							id="price"
							type="number"
							value={formData.price}
							onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="salePrice">Sale Price</Label>
						<Input
							id="salePrice"
							type="number"
							value={formData.salePrice || ''}
							onChange={(e) => setFormData(prev => ({
								...prev,
								salePrice: e.target.value ? Number(e.target.value) : undefined
							}))}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="unit">Unit</Label>
					<Input
						id="unit"
						value={formData.unit}
						onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
					/>
				</div>

				{/* Variants */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Variants</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="space-y-3">
								<div className="space-y-2">
									<Label>Variant Name</Label>
									<Input
										placeholder="e.g., Small, Medium, Large"
										value={newVariant.name}
										onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>Price</Label>
										<Input
											placeholder="0.00"
											type="number"
											value={newVariant.price}
											onChange={(e) => setNewVariant(prev => ({ ...prev, price: Number(e.target.value) }))}
										/>
									</div>
									<div className="space-y-2">
										<Label>Sale Price</Label>
										<Input
											placeholder="0.00"
											type="number"
											value={newVariant.salePrice || ''}
											onChange={(e) => setNewVariant(prev => ({
												...prev,
												salePrice: e.target.value ? Number(e.target.value) : undefined
											}))}
										/>
									</div>
								</div>
								<div className="flex gap-2">
									<Button type="button" onClick={addVariant} className="flex-1">
										<Plus className="h-4 w-4 mr-2" />
										{editingVariantIndex !== null ? 'Update Variant' : 'Add Variant'}
									</Button>
									{editingVariantIndex !== null && (
										<Button type="button" onClick={cancelEditVariant} variant="outline">
											Cancel
										</Button>
									)}
								</div>
							</div>
							{formData.variants.length > 0 && (
								<div className="space-y-2">
									<Label>Added Variants</Label>
									<div className="space-y-2">
										{formData.variants.map((variant, index) => (
											<div key={index} className={`flex items-center justify-between p-3 border rounded-lg ${editingVariantIndex === index ? 'bg-primary/10 border-primary' : 'bg-muted/50'}`}>
												<span className="text-sm">
													<span className="font-medium">{variant.name}</span> - ${variant.price}
													{variant.salePrice && <span className="text-muted-foreground"> (Sale: ${variant.salePrice})</span>}
												</span>
												<div className="flex gap-1">
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => editVariant(index)}
														disabled={editingVariantIndex !== null && editingVariantIndex !== index}
													>
														<Pencil className="h-4 w-4" />
													</Button>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => removeVariant(index)}
													>
														<X className="h-4 w-4" />
													</Button>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</form>

			<SheetFooter className="gap-2 px-4 py-4 border-t">
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