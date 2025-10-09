'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { adjustStock } from '@/hooks/stocks';
import { Spinner } from '../ui/shadcn-io/spinner';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProducts } from '@/hooks/products';
import { useWarehouses } from '@/hooks/warehouses';
import { useStocks } from '@/hooks/stocks';

const adjustStockSchema = z.object({
	productId: z.string().min(1, 'Product is required'),
	variantName: z.string().nullable(),
	warehouseId: z.string().min(1, 'Warehouse is required'),
	quantity: z.number().min(1, 'Quantity must be at least 1'),
	reason: z.string().min(1, 'Please provide a reason for the adjustment'),
});

type AdjustStockFormData = z.infer<typeof adjustStockSchema>;

interface StockAdjustFormProps {
	onSuccess: () => void;
}

export function StockAdjustForm({ onSuccess }: StockAdjustFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [productSearchOpen, setProductSearchOpen] = useState(false);
	const [warehouseSearchOpen, setWarehouseSearchOpen] = useState(false);
	const [currentStock, setCurrentStock] = useState<number | null>(null);

	const { data: productsData } = useProducts({ page: 1, limit: 100 });
	const { data: warehousesData } = useWarehouses({ page: 1, limit: 100 });

	const form = useForm<AdjustStockFormData>({
		resolver: zodResolver(adjustStockSchema),
		defaultValues: {
			productId: '',
			variantName: null,
			warehouseId: '',
			quantity: 1,
			reason: '',
		},
	});

	const products = productsData?.data || [];
	const warehouses = warehousesData?.data || [];

	const selectedProductId = form.watch('productId');
	const selectedVariantName = form.watch('variantName');
	const selectedWarehouseId = form.watch('warehouseId');
	const quantityToDeduct = form.watch('quantity');

	const selectedProduct = products.find((p) => p._id === selectedProductId);

	// Fetch current stock when product, variant, and warehouse are selected
	const { data: stocksData } = useStocks({
		productId: selectedProductId,
		warehouseId: selectedWarehouseId,
	});

	useEffect(() => {
		if (stocksData?.data) {
			const stock = stocksData.data.find(
				(s) =>
					s.productId._id === selectedProductId &&
					s.variantName === selectedVariantName &&
					s.warehouseId._id === selectedWarehouseId
			);
			setCurrentStock(stock?.quantity ?? null);
		}
	}, [stocksData, selectedProductId, selectedVariantName, selectedWarehouseId]);

	const onSubmit = async (data: AdjustStockFormData) => {
		if (currentStock === null) {
			toast.error('No stock found for this combination');
			return;
		}

		if (data.quantity > currentStock) {
			toast.error(`Cannot deduct more than current stock (${currentStock})`);
			return;
		}

		setIsSubmitting(true);
		try {
			// Find the stock ID
			const stock = stocksData?.data.find(
				(s) =>
					s.productId._id === data.productId &&
					s.variantName === data.variantName &&
					s.warehouseId._id === data.warehouseId
			);

			if (!stock) {
				toast.error('Stock not found');
				return;
			}

			await adjustStock(stock._id, {
				quantity: data.quantity,
				reason: data.reason,
			});
			toast.success('Stock adjusted successfully');
			form.reset();
			setCurrentStock(null);
			onSuccess();
		} catch {
			toast.error('Failed to adjust stock');
		} finally {
			setIsSubmitting(false);
		}
	};

	const newQuantity =
		currentStock !== null ? Math.max(0, currentStock - (quantityToDeduct || 0)) : null;

	return (
		<div className="h-full flex flex-col">
			<SheetHeader>
				<SheetTitle>Adjust Stock</SheetTitle>
				<SheetDescription>
					Deduct stock quantity from inventory. Search for product and warehouse to adjust.
				</SheetDescription>
			</SheetHeader>

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4 mt-6 flex-1 flex flex-col"
				>
					<div className="flex-1 space-y-4 overflow-y-auto">
						{/* Product Selection */}
						<FormField
							control={form.control}
							name="productId"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Product</FormLabel>
									<Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													role="combobox"
													className={cn(
														'justify-between',
														!field.value && 'text-muted-foreground'
													)}
												>
													{field.value
														? products.find((p) => p._id === field.value)?.title
														: 'Search product...'}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-[400px] p-0">
											<Command>
												<CommandInput placeholder="Search product..." />
												<CommandList>
													<CommandEmpty>No product found.</CommandEmpty>
													<CommandGroup>
														{products.map((product) => (
															<CommandItem
																key={product._id}
																value={product.title}
																onSelect={() => {
																	form.setValue('productId', product._id);
																	form.setValue('variantName', null);
																	setProductSearchOpen(false);
																}}
															>
																<Check
																	className={cn(
																		'mr-2 h-4 w-4',
																		product._id === field.value
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
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Variant Selection */}
						{selectedProduct && selectedProduct.variants.length > 0 && (
							<FormField
								control={form.control}
								name="variantName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Variant</FormLabel>
										<FormControl>
											<select
												className="w-full rounded-md border border-input bg-background px-3 py-2"
												{...field}
												value={field.value || ''}
											>
												<option value="">Base Product</option>
												{selectedProduct.variants.map((variant) => (
													<option key={variant.name} value={variant.name}>
														{variant.name}
													</option>
												))}
											</select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* Warehouse Selection */}
						<FormField
							control={form.control}
							name="warehouseId"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Warehouse</FormLabel>
									<Popover
										open={warehouseSearchOpen}
										onOpenChange={setWarehouseSearchOpen}
									>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													role="combobox"
													className={cn(
														'justify-between',
														!field.value && 'text-muted-foreground'
													)}
												>
													{field.value
														? warehouses.find((w) => w._id === field.value)?.title
														: 'Search warehouse...'}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-[400px] p-0">
											<Command>
												<CommandInput placeholder="Search warehouse..." />
												<CommandList>
													<CommandEmpty>No warehouse found.</CommandEmpty>
													<CommandGroup>
														{warehouses.map((warehouse) => (
															<CommandItem
																key={warehouse._id}
																value={warehouse.title}
																onSelect={() => {
																	form.setValue('warehouseId', warehouse._id);
																	setWarehouseSearchOpen(false);
																}}
															>
																<Check
																	className={cn(
																		'mr-2 h-4 w-4',
																		warehouse._id === field.value
																			? 'opacity-100'
																			: 'opacity-0'
																	)}
																/>
																{warehouse.title}
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Current Stock Display */}
						{currentStock !== null && (
							<div className="rounded-lg border p-4 bg-muted/50">
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Current Stock:</span>
									<span className="font-semibold">{currentStock}</span>
								</div>
								{newQuantity !== null && (
									<div className="flex items-center justify-between text-sm mt-2">
										<span className="text-muted-foreground">New Stock:</span>
										<span className="font-semibold text-primary">{newQuantity}</span>
									</div>
								)}
							</div>
						)}

						{/* Quantity Input */}
						<FormField
							control={form.control}
							name="quantity"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Quantity to Deduct</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="1"
											max={currentStock || undefined}
											placeholder="Enter quantity"
											{...field}
											onChange={(e) =>
												field.onChange(
													e.target.value ? parseInt(e.target.value, 10) : 0
												)
											}
										/>
									</FormControl>
									{currentStock !== null && (
										<FormDescription>Maximum: {currentStock} units</FormDescription>
									)}
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Reason */}
						<FormField
							control={form.control}
							name="reason"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Reason</FormLabel>
									<FormControl>
										<Textarea
											placeholder="e.g., Damaged goods, Customer return, Quality issue, etc."
											className="resize-none"
											rows={3}
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Explain why the stock is being adjusted
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="flex justify-end gap-2 pt-4 border-t">
						<Button type="submit" disabled={isSubmitting || currentStock === null}>
							{isSubmitting ? (
								<>
									<Spinner variant="pinwheel" className="mr-2" />
									Adjusting...
								</>
							) : (
								'Adjust Stock'
							)}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
