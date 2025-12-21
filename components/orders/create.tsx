'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Search, Package, DollarSign, User, ShoppingCart, X, Minus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { OrderFormData } from '@/types/order';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useProducts } from '@/hooks/products';
import { useWarehouses } from '@/hooks/warehouses';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OrderFormProps {
	onSuccess: () => void;
}

interface OrderProductItem {
	_id: string;
	productId: string;
	productTitle: string;
	productSlug: string;
	thumbnail?: string;
	variantName: string | null;
	warehouseId: string | null;
	warehouseName: string | null;
	price: number;
	salePrice?: number;
	quantity: number;
	lineTotal: number;
}

export function OrderForm({ onSuccess }: OrderFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [orderProducts, setOrderProducts] = useState<OrderProductItem[]>([]);
	const [orderDate, setOrderDate] = useState(
		new Date().toISOString().slice(0, 16)
	);
	const [searchQuery, setSearchQuery] = useState('');
	const [showProductSearch, setShowProductSearch] = useState(false);

	// Fetch products and warehouses
	const { data: productsData } = useProducts({ limit: 100, search: searchQuery });
	const { data: warehousesData } = useWarehouses({ limit: 100 });

	const products = productsData?.data || [];
	const warehouses = warehousesData?.data || [];

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		control,
		formState: { errors },
	} = useForm<OrderFormData>({
		defaultValues: {
			order_code: `ORD-${Date.now()}`,
			order_date: new Date().toISOString(),
			order_status: 'pending',
			order_payment_status: 'unpaid',
			discount_amount: 0,
			delivery_cost: 0,
			paid_amount: 0,
		},
	});

	const watchDiscountAmount = watch('discount_amount', 0);
	const watchDeliveryCost = watch('delivery_cost', 0);
	const watchPaidAmount = watch('paid_amount', 0);

	// Calculate totals
	const subTotal = orderProducts.reduce(
		(sum, product) => sum + product.lineTotal,
		0
	);
	const orderAmount =
		subTotal - (watchDiscountAmount || 0) + (watchDeliveryCost || 0);
	const dueAmount = orderAmount - (watchPaidAmount || 0);

	useEffect(() => {
		setValue('order_amount', orderAmount);
		setValue('due_amount', dueAmount);
	}, [orderAmount, dueAmount, setValue]);

	const addProductToOrder = (
		product: typeof products[0],
		variantName: string | null,
		warehouseId: string | null
	) => {
		const actualWarehouseId = warehouseId;
		let warehouse = null;
		let warehouseName = null;

		if (warehouseId) {
			warehouse = warehouses.find((w: { _id: string; title: string }) => w._id === warehouseId);
			if (!warehouse) {
				toast.error('Please select a valid warehouse');
				return;
			}
			warehouseName = warehouse.title;
		}

		const variant = variantName
			? product.variants.find((v: { name: string; price: number; salePrice?: number }) => v.name === variantName)
			: null;

		const price = variant?.price || product.price;
		const salePrice = variant?.salePrice || product.salePrice;
		const effectivePrice = salePrice || price;

		const newProduct: OrderProductItem = {
			_id: `temp-${Date.now()}`,
			productId: product._id,
			productTitle: product.title,
			productSlug: product.slug,
			thumbnail: product.thumbnail,
			variantName,
			warehouseId: actualWarehouseId,
			warehouseName,
			price,
			salePrice,
			quantity: 1,
			lineTotal: effectivePrice,
		};

		setOrderProducts([...orderProducts, newProduct]);
		setShowProductSearch(false);
		setSearchQuery('');
		toast.success('Product added to order');
	};

	const removeProduct = (index: number) => {
		setOrderProducts(orderProducts.filter((_, i) => i !== index));
	};

	const updateProductQuantity = (index: number, quantity: number) => {
		if (quantity < 1) return;

		const updatedProducts = [...orderProducts];
		const product = updatedProducts[index];
		const effectivePrice = product.salePrice || product.price;

		updatedProducts[index] = {
			...product,
			quantity,
			lineTotal: effectivePrice * quantity,
		};

		setOrderProducts(updatedProducts);
	};

	const onSubmit = async (data: OrderFormData) => {
		if (orderProducts.length === 0) {
			toast.error('Please add at least one product');
			return;
		}

		setIsSubmitting(true);

		// Transform order products to match backend schema (ensuring warehouseId is always present)
		const productsWithWarehouse = orderProducts.map((p) => ({
			_id: p.productId,
			slug: p.productSlug,
			title: p.productTitle,
			thumbnail: p.thumbnail,
			basePrice: p.price,
			price: p.salePrice || p.price,
			quantity: p.quantity,
			variantName: p.variantName,
			variantPrice: p.variantName ? p.price : null,
			variantSalePrice: p.variantName ? p.salePrice : null,
			warehouseId: p.warehouseId,
			lineTotal: p.lineTotal,
		}));

		const orderData = {
			customerName: data.name,
			customerMobile: data.contact_number,
			customerEmail: data.email,
			customerAddress: data.address,
			customerDistrict: data.city,
			code: data.order_code,
			products: productsWithWarehouse,
			subTotal,
			total: orderAmount,
			discount: watchDiscountAmount || 0,
			deliveryCost: watchDeliveryCost || 0,
			paid: watchPaidAmount || 0,
			due: dueAmount,
			paymentStatus: data.order_payment_status,
			status: data.order_status,
			remark: data.remark,
		};

		try {
			const response = await fetch('/api/orders', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(orderData),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to create order');
			}

			toast.success('Order created successfully');
			onSuccess();
		} catch (error: unknown) {
			const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
				? error.message
				: 'Failed to create order';
			toast.error(errorMessage);
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="h-full overflow-y-auto">
			<SheetHeader className="mb-6">
				<SheetTitle className="flex items-center gap-2">
					<ShoppingCart className="h-5 w-5" />
					Create New Order
				</SheetTitle>
			</SheetHeader>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-6">
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
					{/* Customer Information */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<User className="h-4 w-4" />
								<CardTitle className="text-base">Customer Information</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="p-2">
							<div className="space-y-3">
								<div>
									<Label htmlFor="name" className="text-sm">
										Name <span className="text-red-500">*</span>
									</Label>
									<Input
										id="name"
										{...register('name', { required: 'Name is required' })}
										placeholder="Customer name"
										className={cn(errors.name && 'border-red-500')}
									/>
									{errors.name && (
										<p className="text-xs text-red-500 mt-1">
											{errors.name.message}
										</p>
									)}
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<div>
										<Label htmlFor="contact_number" className="text-sm">
											Contact <span className="text-red-500">*</span>
										</Label>
										<Input
											id="contact_number"
											{...register('contact_number', {
												required: 'Contact is required',
											})}
											placeholder="Phone number"
											className={cn(errors.contact_number && 'border-red-500')}
										/>
										{errors.contact_number && (
											<p className="text-xs text-red-500 mt-1">
												{errors.contact_number.message}
											</p>
										)}
									</div>
									<div>
										<Label htmlFor="email" className="text-sm">Email</Label>
										<Input
											id="email"
											type="email"
											{...register('email')}
											placeholder="customer@example.com"
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="address" className="text-sm">
										Address <span className="text-red-500">*</span>
									</Label>
									<Input
										id="address"
										{...register('address', { required: 'Address is required' })}
										placeholder="Delivery address"
										className={cn(errors.address && 'border-red-500')}
									/>
									{errors.address && (
										<p className="text-xs text-red-500 mt-1">
											{errors.address.message}
										</p>
									)}
								</div>

								<div>
									<Label htmlFor="city" className="text-sm">
										City <span className="text-red-500">*</span>
									</Label>
									<Input
										id="city"
										{...register('city', { required: 'City is required' })}
										placeholder="City"
										className={cn(errors.city && 'border-red-500')}
									/>
									{errors.city && (
										<p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Order Details */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Package className="h-4 w-4" />
								<CardTitle className="text-base">Order Details</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="p-2">
							<div className="space-y-3">
								<div>
									<Label htmlFor="order_code" className="text-sm">Order Code</Label>
									<Input
										id="order_code"
										{...register('order_code')}
										readOnly
										className="bg-muted font-mono text-xs"
									/>
								</div>

								<div>
									<Label htmlFor="order_date" className="text-sm flex items-center gap-2">
										<Clock className="h-4 w-4" />
										Order Date & Time
									</Label>
									<Input
										id="order_date"
										type="datetime-local"
										value={orderDate}
										onChange={(e) => {
											setOrderDate(e.target.value);
											setValue('order_date', new Date(e.target.value).toISOString());
										}}
									/>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<div>
										<Label htmlFor="order_status" className="text-sm">Order Status</Label>
										<Controller
											name="order_status"
											control={control}
											render={({ field }) => (
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="pending">
															<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400"></span> Pending</span>
														</SelectItem>
														<SelectItem value="processing">
															<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Processing</span>
														</SelectItem>
														<SelectItem value="confirmed">
															<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span> Confirmed</span>
														</SelectItem>
														<SelectItem value="shipped">
															<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400"></span> Shipped</span>
														</SelectItem>
														<SelectItem value="delivered">
															<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Delivered</span>
														</SelectItem>
														<SelectItem value="cancelled">
															<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Cancelled</span>
														</SelectItem>
													</SelectContent>
												</Select>
											)}
										/>
									</div>

									<div>
										<Label htmlFor="order_payment_status" className="text-sm">Payment Status</Label>
										<Controller
											name="order_payment_status"
											control={control}
											render={({ field }) => (
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="unpaid">
															<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Unpaid</span>
														</SelectItem>
														<SelectItem value="partial">
															<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Partial</span>
														</SelectItem>
														<SelectItem value="paid">
															<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span> Paid</span>
														</SelectItem>
													</SelectContent>
												</Select>
											)}
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="remark" className="text-sm">Additional Notes</Label>
									<Textarea
										id="remark"
										{...register('remark')}
										placeholder="Any additional notes or special instructions..."
										rows={2}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Products Section */}
				<Card>
					<CardHeader className="pb-2">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<Package className="h-4 w-4" />
								<CardTitle className="text-base">Products ({orderProducts.length})</CardTitle>
							</div>
							<Button
								type="button"
								onClick={() => setShowProductSearch(true)}
								size="sm"
								variant="outline"
								className="w-full sm:w-auto"
							>
								<Plus className="h-4 w-4 mr-1" />
								Add Product
							</Button>
						</div>
					</CardHeader>
					<CardContent className="p-4">
						{orderProducts.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
								<p className="text-sm">No products added yet</p>
								<p className="text-xs">Click &ldquo;Add Product&rdquo; to start</p>
							</div>
						) : (
							<div className="space-y-3">
								{orderProducts.map((product, index) => (
									<div
										key={product._id}
										className="border rounded-lg p-3 hover:bg-accent/30 transition-colors"
									>
										<div className="flex gap-3 mb-3">
											{product.thumbnail && (
												<div className="bg-gray-100 rounded p-1 flex-shrink-0">
													<img
														src={product.thumbnail}
														alt={product.productTitle}
														className="w-12 h-12 sm:w-10 sm:h-10 object-cover rounded"
													/>
												</div>
											)}
											<div className="flex-1 min-w-0">
												<div className="flex flex-col sm:flex-row sm:items-center gap-2">
													<h4 className="font-medium text-sm truncate">{product.productTitle}</h4>
													{product.variantName && (
														<Badge variant="secondary" className="text-xs w-fit">
															{product.variantName}
														</Badge>
													)}
												</div>
												<div className="flex flex-wrap items-center gap-2 mt-1">
													{product.warehouseName && (
														<Badge variant="outline" className="text-xs">
															{product.warehouseName}
														</Badge>
													)}
													<span className="text-xs text-muted-foreground">
														৳{product.salePrice || product.price} each
													</span>
												</div>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0 text-red-500 hover:text-red-600 flex-shrink-0"
												onClick={() => removeProduct(index)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>

										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Button
													type="button"
													variant="outline"
													size="sm"
													className="h-8 w-8 p-0 rounded-full"
													onClick={() => updateProductQuantity(index, product.quantity - 1)}
													disabled={product.quantity <= 1}
												>
													<Minus className="h-3 w-3" />
												</Button>
												<span className="text-sm font-medium min-w-[24px] text-center">
													{product.quantity}
												</span>
												<Button
													type="button"
													variant="outline"
													size="sm"
													className="h-8 w-8 p-0 rounded-full"
													onClick={() => updateProductQuantity(index, product.quantity + 1)}
												>
													<Plus className="h-3 w-3" />
												</Button>
											</div>

											<div className="text-sm font-semibold">
												৳{product.lineTotal.toFixed(2)}
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Financial Summary */}
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<DollarSign className="h-4 w-4" />
							<CardTitle className="text-base">Financial Summary</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="space-y-3 p-2">
						<div className="space-y-3">
							<div className="flex justify-between items-center border-b pb-2">
								<span className="text-sm">Subtotal ({orderProducts.length} items)</span>
								<span className="font-medium">৳{subTotal.toFixed(2)}</span>
							</div>
							
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<Label htmlFor="discount_amount" className="text-sm">Discount (৳)</Label>
									<Input
										id="discount_amount"
										type="number"
										{...register('discount_amount', { valueAsNumber: true })}
										placeholder="0.00"
										step="0.01"
										min="0"
									/>
								</div>

								<div>
									<Label htmlFor="delivery_cost" className="text-sm">Delivery (৳)</Label>
									<Input
										id="delivery_cost"
										type="number"
										{...register('delivery_cost', { valueAsNumber: true })}
										placeholder="0.00"
										step="0.01"
										min="0"
									/>
								</div>
							</div>

							<div className="flex justify-between items-center bg-accent p-3 rounded">
								<span className="font-medium">Order Total</span>
								<span className="text-xl font-bold text-primary">
									৳{orderAmount.toFixed(2)}
								</span>
							</div>

							<div>
								<Label htmlFor="paid_amount" className="text-sm">Paid Amount (৳)</Label>
								<Input
									id="paid_amount"
									type="number"
									{...register('paid_amount', { valueAsNumber: true })}
									placeholder="0.00"
									step="0.01"
									min="0"
								/>
							</div>

							<div className="flex justify-between items-center pt-2">
								<span className="font-medium">Due Amount</span>
								<span className={cn(
									"text-xl font-bold",
									dueAmount > 0 ? "text-red-600" : dueAmount === 0 ? "text-green-600" : "text-blue-600"
								)}>
									৳{dueAmount.toFixed(2)}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Submit Button */}
				<div className="sticky bottom-0 bg-background pt-3 pb-2 border-t">
					<Button
						type="submit"
						disabled={isSubmitting || orderProducts.length === 0}
						className="w-full"
						size="lg"
					>
						{isSubmitting ? (
							<span className="flex items-center justify-center">
								Creating Order...
							</span>
						) : (
							<span className="flex items-center justify-center">
								<ShoppingCart className="h-5 w-5 mr-2" />
								Create Order
							</span>
						)}
					</Button>
				</div>
			</form>

			{/* Product Search Modal */}
			{showProductSearch && (
				<ProductSearchDialog
					products={products}
					warehouses={warehouses}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					onAddProduct={addProductToOrder}
					onClose={() => {
						setShowProductSearch(false);
						setSearchQuery('');
					}}
				/>
			)}
		</div>
	);
}

// Product Search Dialog Component
interface ProductSearchDialogProps {
	products: Array<{
		_id: string;
		title: string;
		slug: string;
		thumbnail?: string;
		price: number;
		salePrice?: number;
		quantity?: number;
		variants: Array<{
			name: string;
			price: number;
			salePrice?: number;
			quantity?: number;
		}>;
	}>;
	warehouses: Array<{
		_id: string;
		title: string;
	}>;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	onAddProduct: (product: ProductSearchDialogProps['products'][0], variantName: string | null, warehouseId: string | null) => void;
	onClose: () => void;
}

function ProductSearchDialog({
	products,
	warehouses,
	searchQuery,
	setSearchQuery,
	onAddProduct,
	onClose,
}: ProductSearchDialogProps) {
	const [selectedProduct, setSelectedProduct] = useState<ProductSearchDialogProps['products'][0] | null>(null);
	const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
	const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');

	const handleAdd = () => {
		if (!selectedProduct) {
			toast.error('Please select a product');
			return;
		}

		onAddProduct(selectedProduct, selectedVariant, selectedWarehouse || null);
		setSelectedProduct(null);
		setSelectedVariant(null);
		setSelectedWarehouse('');
	};

	return (
		<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
			<Card className="w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col">
				<CardHeader className="pb-2 border-b">
					<div className="flex items-center justify-between">
						<CardTitle className="text-base flex items-center gap-2">
							<Search className="h-4 w-4" />
							Add Product to Order
						</CardTitle>
						<Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
							<X className="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>

				<CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
					{/* Search Input */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search products..."
							className="pl-9"
							autoFocus
						/>
					</div>

					{/* Product List */}
					<div className="space-y-2">
						<Label>Select Product</Label>
						<div className="border rounded-lg divide-y max-h-[50vh] overflow-y-auto">
							{products.length === 0 ? (
								<div className="p-4 text-center text-muted-foreground">
									No products found
								</div>
							) : (
								products.map((product) => (
									<div
										key={product._id}
										className={cn(
											"p-3 cursor-pointer hover:bg-accent transition-colors flex gap-2",
											selectedProduct?._id === product._id && "bg-accent"
										)}
										onClick={() => {
											setSelectedProduct(product);
											setSelectedVariant(null);
										}}
									>
										{product.thumbnail && (
											<div className="bg-gray-100 rounded p-1 flex-shrink-0">
												<img 
													src={product.thumbnail} 
													alt={product.title} 
													className="w-10 h-10 object-cover rounded" 
												/>
											</div>
										)}
										<div className="flex-1 min-w-0">
											<h4 className="font-medium text-sm truncate">{product.title}</h4>
											<div className="flex flex-wrap items-center gap-2 mt-1">
												<span className="text-sm font-medium text-primary">
													৳{product.salePrice || product.price}
												</span>
												{product.variants?.length > 0 && (
													<Badge variant="outline" className="text-xs">
														{product.variants.length} variants
													</Badge>
												)}
												<Badge variant="secondary" className="text-xs">
													Stock: {product.quantity || 0}
												</Badge>
											</div>
										</div>
										{selectedProduct?._id === product._id && (
											<Badge variant="default" className="text-xs flex-shrink-0">
												Selected
											</Badge>
										)}
									</div>
								))
							)}
						</div>
					</div>

					{/* Variant Selection */}
					{selectedProduct && selectedProduct.variants?.length > 0 && (
						<div className="space-y-2">
							<Label>Select Variant (Optional)</Label>
							<Select
								value={selectedVariant || 'base'}
								onValueChange={(value) => setSelectedVariant(value === 'base' ? null : value)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="base">
										Base Product - ৳{selectedProduct.salePrice || selectedProduct.price}
									</SelectItem>
									{selectedProduct.variants.map((variant) => (
										<SelectItem key={variant.name} value={variant.name}>
											{variant.name} - ৳{variant.salePrice || variant.price}
											{variant.quantity !== undefined && (
												<span className="text-xs text-muted-foreground ml-1">
													(Stock: {variant.quantity})
												</span>
											)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					{/* Warehouse Selection */}
					<div className="space-y-2">
						<Label htmlFor="warehouse">Select Warehouse (Optional)</Label>
						<Select
							value={selectedWarehouse}
							onValueChange={setSelectedWarehouse}
						>
							<SelectTrigger>
								<SelectValue placeholder="Choose warehouse (optional)" />
							</SelectTrigger>
							<SelectContent>
								{warehouses.map((warehouse) => (
									<SelectItem key={warehouse._id} value={warehouse._id}>
										{warehouse.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Selected Product Preview */}
					{selectedProduct && (
						<div className="bg-accent rounded-lg p-3 space-y-1">
							<p className="text-xs font-medium">Preview:</p>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									{selectedProduct.thumbnail && (
										<img
											src={selectedProduct.thumbnail}
											alt={selectedProduct.title}
											className="w-8 h-8 object-cover rounded"
										/>
									)}
									<div>
										<p className="text-sm font-medium">{selectedProduct.title}</p>
										{selectedVariant && (
											<Badge variant="secondary" className="text-xs mt-1">
												{selectedVariant}
											</Badge>
										)}
									</div>
								</div>
								<div className="text-right">
									<p className="text-sm font-semibold">
										৳{selectedVariant
											? (selectedProduct.variants.find((v) => v.name === selectedVariant)?.salePrice ||
											   selectedProduct.variants.find((v) => v.name === selectedVariant)?.price)
											: (selectedProduct.salePrice || selectedProduct.price)}
									</p>
									{selectedWarehouse && (
										<p className="text-xs text-muted-foreground">
											{warehouses.find((w) => w._id === selectedWarehouse)?.title}
										</p>
									)}
								</div>
							</div>
						</div>
					)}
				</CardContent>

				<div className="p-3 border-t flex gap-2">
					<Button variant="outline" onClick={onClose} className="flex-1">
						Cancel
					</Button>
					<Button
						onClick={handleAdd}
						disabled={!selectedProduct}
						className="flex-1"
					>
						Add to Order
					</Button>
				</div>
			</Card>
		</div>
	);
}
