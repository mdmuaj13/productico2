'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createStock } from '@/hooks/stocks';
import { useProducts } from '@/hooks/products';
import { useWarehouses } from '@/hooks/warehouses';

interface VariantStock {
	variantName: string | null;
	quantity: number;
	reorderPoint: number;
}

interface FormData {
	productId: string;
	warehouseId: string;
	variantStocks: VariantStock[];
}

interface StockFormProps {
	onSuccess?: () => void;
}

export function StockForm({ onSuccess }: StockFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [productOpen, setProductOpen] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		productId: '',
		warehouseId: '',
		variantStocks: [],
	});

	const { data: productsData } = useProducts({ page: 1, limit: 1000 });
	const { data: warehousesData } = useWarehouses({ page: 1, limit: 1000 });

	const products = productsData?.data || [];
	const warehouses = warehousesData?.data || [];

	// Get selected product to show variants
	const selectedProduct = products.find((p: { _id: string }) => p._id === formData.productId);
	const variants = selectedProduct?.variants || [];

	// Initialize variant stocks when product changes
	useEffect(() => {
		if (formData.productId) {
			if (variants.length > 0) {
				// Product has variants - create entry for each variant
				setFormData((prev) => ({
					...prev,
					variantStocks: variants.map((variant: { name: string }) => ({
						variantName: variant.name,
						quantity: 0,
						reorderPoint: 10,
					})),
				}));
			} else {
				// Product has no variants - single entry for base product
				setFormData((prev) => ({
					...prev,
					variantStocks: [
						{
							variantName: null,
							quantity: 0,
							reorderPoint: 10,
						},
					],
				}));
			}
		} else {
			setFormData((prev) => ({
				...prev,
				variantStocks: [],
			}));
		}
	}, [formData.productId, variants.length]);

	const handleChange = (name: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleVariantStockChange = (
		index: number,
		field: 'quantity' | 'reorderPoint',
		value: number
	) => {
		setFormData((prev) => ({
			...prev,
			variantStocks: prev.variantStocks.map((stock, i) =>
				i === index ? { ...stock, [field]: value } : stock
			),
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			// Create stock entry for each variant
			const promises = formData.variantStocks.map((variantStock) =>
				createStock({
					productId: formData.productId,
					variantName: variantStock.variantName,
					warehouseId: formData.warehouseId,
					quantity: variantStock.quantity,
					reorderPoint: variantStock.reorderPoint,
				})
			);

			await Promise.all(promises);

			const count = formData.variantStocks.length;
			toast.success(`${count} stock ${count === 1 ? 'entry' : 'entries'} created successfully`);

			// Reset form
			setFormData({
				productId: '',
				warehouseId: '',
				variantStocks: [],
			});

			onSuccess?.();
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Failed to create stock'
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-full space-y-6 p-4 py-8">
			<SheetHeader className="px-0">
				<SheetTitle>Add Stock</SheetTitle>
				<SheetDescription>
					Add stock quantity for products in a warehouse.
				</SheetDescription>
			</SheetHeader>

			<form onSubmit={handleSubmit} className="flex-1 space-y-4 py-4 overflow-y-auto">
				<div className="space-y-2">
					<Label>Product *</Label>
					<Popover open={productOpen} onOpenChange={setProductOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={productOpen}
								className="w-full justify-between"
							>
								{formData.productId
									? products.find((product: { _id: string; title: string }) => product._id === formData.productId)
											?.title
									: 'Select a product'}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
							<Command>
								<CommandInput placeholder="Search products..." />
								<CommandList>
									<CommandEmpty>No product found.</CommandEmpty>
									<CommandGroup>
										{products.map((product: { _id: string; title: string }) => (
											<CommandItem
												key={product._id}
												value={product.title}
												onSelect={() => {
													handleChange('productId', product._id);
													setProductOpen(false);
												}}
											>
												<Check
													className={cn(
														'mr-2 h-4 w-4',
														formData.productId === product._id
															? 'opacity-100'
															: 'opacity-0'
													)}
												/>
												{product.title}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				<div className="space-y-2">
					<Label htmlFor="warehouseId">Warehouse *</Label>
					<Select
						value={formData.warehouseId}
						onValueChange={(value) => handleChange('warehouseId', value)}
						required
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select a warehouse" />
						</SelectTrigger>
						<SelectContent className="w-full">
							{warehouses.map((warehouse: { _id: string; title: string }) => (
								<SelectItem key={warehouse._id} value={warehouse._id}>
									{warehouse.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Show variant stock inputs */}
				{formData.variantStocks.length > 0 && (
					<div className="space-y-4 pt-4 border-t">
						<div className="space-y-2">
							<Label className="text-base font-semibold">
								{variants.length > 0 ? 'Variant Stock Quantities' : 'Stock Quantity'}
							</Label>
							<p className="text-sm text-muted-foreground">
								{variants.length > 0
									? 'Enter quantity for each variant'
									: 'Enter stock quantity for this product'}
							</p>
						</div>

						{formData.variantStocks.map((variantStock, index) => (
							<div
								key={index}
								className="p-4 border rounded-lg space-y-3 bg-muted/30"
							>
								<div className="font-medium text-sm">
									{variantStock.variantName || 'Base Product'}
									{variantStock.variantName && variants[index] && (
										<span className="text-muted-foreground ml-2">
											(${variants[index].price})
										</span>
									)}
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-2">
										<Label htmlFor={`quantity-${index}`}>Quantity *</Label>
										<Input
											id={`quantity-${index}`}
											type="number"
											min="0"
											placeholder="0"
											value={variantStock.quantity}
											onChange={(e) =>
												handleVariantStockChange(
													index,
													'quantity',
													parseInt(e.target.value) || 0
												)
											}
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor={`reorderPoint-${index}`}>
											Reorder Point
										</Label>
										<Input
											id={`reorderPoint-${index}`}
											type="number"
											min="0"
											placeholder="10"
											value={variantStock.reorderPoint}
											onChange={(e) =>
												handleVariantStockChange(
													index,
													'reorderPoint',
													parseInt(e.target.value) || 0
												)
											}
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</form>

			<SheetFooter className="gap-2 px-0 mt-auto">
				<SheetClose asChild>
					<Button type="button" variant="outline" disabled={isLoading}>
						Cancel
					</Button>
				</SheetClose>
				<Button
					type="submit"
					disabled={isLoading || formData.variantStocks.length === 0}
					onClick={handleSubmit}
				>
					{isLoading ? 'Creating...' : 'Create Stock'}
				</Button>
			</SheetFooter>
		</div>
	);
}
