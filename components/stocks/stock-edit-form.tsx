'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { updateStock } from '@/hooks/stocks';

interface Variant {
	name: string;
	price: number;
	salePrice?: number;
}

interface Product {
	_id: string;
	title: string;
	slug: string;
	thumbnail?: string;
	variants: Variant[];
}

interface Warehouse {
	_id: string;
	title: string;
	slug: string;
}

interface Stock {
	_id: string;
	productId: Product;
	variantName: string | null;
	warehouseId: Warehouse;
	quantity: number;
	reorderPoint?: number;
	createdAt: string;
	updatedAt: string;
}

interface FormData {
	quantity: number;
	reorderPoint: number;
}

interface StockEditFormProps {
	stock: Stock;
	onSuccess?: () => void;
}

export function StockEditForm({ stock, onSuccess }: StockEditFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		quantity: stock.quantity,
		reorderPoint: stock.reorderPoint || 10,
	});

	const handleChange = (name: string, value: number) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await updateStock(stock._id, formData);
			toast.success('Stock updated successfully');

			onSuccess?.();
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to update stock'
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-full space-y-6 p-4 py-8">
			<SheetHeader className="px-0">
				<SheetTitle>Edit Stock</SheetTitle>
				<SheetDescription>
					Update stock quantity for {stock.productId.title}
					{stock.variantName && ` - ${stock.variantName}`} at{' '}
					{stock.warehouseId.title}
				</SheetDescription>
			</SheetHeader>

			<form onSubmit={handleSubmit} className="flex-1 space-y-4 py-4 overflow-y-auto">
				<div className="space-y-2">
					<Label>Product</Label>
					<div className="p-3 bg-muted rounded-md text-sm">
						{stock.productId.title}
						{stock.variantName && ` - ${stock.variantName}`}
					</div>
				</div>

				<div className="space-y-2">
					<Label>Warehouse</Label>
					<div className="p-3 bg-muted rounded-md text-sm">
						{stock.warehouseId.title}
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="quantity">Quantity *</Label>
					<Input
						id="quantity"
						name="quantity"
						type="number"
						min="0"
						placeholder="Enter quantity"
						value={formData.quantity}
						onChange={(e) =>
							handleChange('quantity', parseInt(e.target.value) || 0)
						}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="reorderPoint">Reorder Point</Label>
					<Input
						id="reorderPoint"
						name="reorderPoint"
						type="number"
						min="0"
						placeholder="Enter reorder point"
						value={formData.reorderPoint}
						onChange={(e) =>
							handleChange('reorderPoint', parseInt(e.target.value) || 0)
						}
					/>
				</div>
			</form>

			<SheetFooter className="gap-2 px-0 mt-auto">
				<Button type="submit" disabled={isLoading} onClick={handleSubmit}>
					{isLoading ? 'Updating...' : 'Update Stock'}
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
