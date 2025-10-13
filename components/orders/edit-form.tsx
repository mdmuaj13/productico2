'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Trash2, User, ShoppingCart, DollarSign, Package, Minus, Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { OrderFormData, OrderProduct } from '@/types/order';
import { Order as APIOrder, updateOrder } from '@/hooks/orders';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface OrderEditFormProps {
	order: APIOrder;
	onSuccess: () => void;
}

export function OrderEditForm({ order, onSuccess }: OrderEditFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Map API order products to form products
	const mappedProducts: OrderProduct[] = order.products.map((p) => ({
		id: p._id,
		title: p.title,
		slug: p.slug,
		price: p.price,
		salePrice: p.variantSalePrice || undefined,
		quantity: p.quantity,
		lineTotal: p.lineTotal,
	}));

	const [products, setProducts] = useState<OrderProduct[]>(mappedProducts);
	const [orderDate, setOrderDate] = useState(
		order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
	);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<OrderFormData>({
		defaultValues: {
			name: order.customerName,
			contact_number: order.customerMobile,
			email: order.customerEmail,
			address: order.customerAddress,
			city: order.customerDistrict || '',
			order_code: order.code,
			order_date: order.createdAt,
			order_status: order.status,
			order_payment_status: order.paymentStatus,
			discount_code: '',
			discount_amount: order.discount,
			delivery_cost: order.deliveryCost,
			paid_amount: order.paid,
			remark: order.remark,
		},
	});

	const watchDiscountAmount = watch('discount_amount', 0);
	const watchDeliveryCost = watch('delivery_cost', 0);
	const watchPaidAmount = watch('paid_amount', 0);

	// Calculate totals
	const subTotal = products.reduce(
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

	const addProduct = () => {
		const newProduct: OrderProduct = {
			id: `temp-${Date.now()}`,
			title: '',
			slug: '',
			price: 0,
			salePrice: 0,
			quantity: 1,
			lineTotal: 0,
		};
		setProducts([...products, newProduct]);
	};

	const removeProduct = (index: number) => {
		setProducts(products.filter((_, i) => i !== index));
	};

	const updateProduct = (
		index: number,
		field: keyof OrderProduct,
		value: string | number
	) => {
		const updatedProducts = [...products];
		updatedProducts[index] = {
			...updatedProducts[index],
			[field]: value,
		};

		// Calculate line total
		const product = updatedProducts[index];
		const effectivePrice = product.salePrice || product.price;
		product.lineTotal = effectivePrice * product.quantity;

		setProducts(updatedProducts);
	};

	const updateQuantity = (index: number, delta: number) => {
		const newQuantity = Math.max(1, products[index].quantity + delta);
		updateProduct(index, 'quantity', newQuantity);
	};

	const onSubmit = async (data: OrderFormData) => {
		if (products.length === 0) {
			toast.error('Please add at least one product');
			return;
		}

		// Check if all products have required fields
		const invalidProduct = products.find(
			(p) => !p.title || p.price <= 0 || p.quantity <= 0
		);
		if (invalidProduct) {
			toast.error('Please fill in all product details');
			return;
		}

		setIsSubmitting(true);

		// Transform form data to API format
		const apiData = {
			customerName: data.name,
			customerMobile: data.contact_number,
			customerEmail: data.email,
			customerAddress: data.address,
			customerDistrict: data.city,
			code: data.order_code,
			products: products.map((p) => ({
				_id: p.id,
				title: p.title,
				slug: p.slug || '',
				basePrice: p.price,
				price: p.salePrice || p.price,
				quantity: p.quantity,
				lineTotal: p.lineTotal,
				variantName: null,
				variantPrice: null,
				variantSalePrice: p.salePrice || null,
				warehouseId: null,
			})),
			discount: data.discount_amount || 0,
			deliveryCost: data.delivery_cost || 0,
			paid: data.paid_amount || 0,
			status: data.order_status,
			paymentStatus: data.order_payment_status,
			remark: data.remark,
			tax: 0,
			paymentType: 'cash' as const,
		};

		try {
			await updateOrder(order._id, apiData);
			toast.success('Order updated successfully');
			onSuccess();
		} catch (error) {
			const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
				? error.message
				: 'Failed to update order';
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
					Edit Order
				</SheetTitle>
			</SheetHeader>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-6">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Customer Information */}
					<Card>
						<CardHeader className="pb-3">
							<div className="flex items-center gap-2">
								<User className="h-4 w-4" />
								<CardTitle className="text-base">Customer Information</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
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

								<div className="grid grid-cols-2 gap-3">
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
									<Textarea
										id="address"
										{...register('address', { required: 'Address is required' })}
										placeholder="Delivery address"
										rows={3}
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
						<CardHeader className="pb-3">
							<div className="flex items-center gap-2">
								<Package className="h-4 w-4" />
								<CardTitle className="text-base">Order Details</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-3">
								<div className="grid grid-cols-2 gap-3">
									<div>
										<Label htmlFor="order_code" className="text-sm">Order Code</Label>
										<Input
											id="order_code"
											{...register('order_code')}
											readOnly
											className="bg-muted"
										/>
									</div>

									<div>
										<Label htmlFor="order_date" className="text-sm">Order Date</Label>
										<Input
											id="order_date"
											type="date"
											value={orderDate}
											onChange={(e) => {
												setOrderDate(e.target.value);
												setValue('order_date', new Date(e.target.value).toISOString());
											}}
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div>
										<Label htmlFor="order_status" className="text-sm">Order Status</Label>
										<Select
											onValueChange={(value) =>
												setValue(
													'order_status',
													value as OrderFormData['order_status']
												)
											}
											defaultValue={order.status}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="pending">Pending</SelectItem>
												<SelectItem value="processing">Processing</SelectItem>
												<SelectItem value="confirmed">Confirmed</SelectItem>
												<SelectItem value="shipped">Shipped</SelectItem>
												<SelectItem value="delivered">Delivered</SelectItem>
												<SelectItem value="cancelled">Cancelled</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label htmlFor="order_payment_status" className="text-sm">Payment Status</Label>
										<Select
											onValueChange={(value) =>
												setValue(
													'order_payment_status',
													value as OrderFormData['order_payment_status']
												)
											}
											defaultValue={order.paymentStatus}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="unpaid">Unpaid</SelectItem>
												<SelectItem value="partial">Partial</SelectItem>
												<SelectItem value="paid">Paid</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Products Section */}
				<Card>
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Package className="h-4 w-4" />
								<CardTitle className="text-base">Products</CardTitle>
								<Badge variant="secondary" className="ml-2">
									{products.length} {products.length === 1 ? 'item' : 'items'}
								</Badge>
							</div>
							<Button type="button" onClick={addProduct} size="sm" variant="outline">
								<Plus className="h-4 w-4 mr-2" />
								Add Product
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{products.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
								<p className="text-sm">No products added yet</p>
								<p className="text-xs mt-1">Click &ldquo;Add Product&rdquo; to add items</p>
							</div>
						) : (
							<div className="space-y-3">
								{products.map((product, index) => (
									<div
										key={product.id}
										className="border rounded-lg p-4 bg-card hover:bg-accent/5 transition-colors relative"
									>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="absolute top-2 right-2 h-8 w-8"
											onClick={() => removeProduct(index)}
										>
											<Trash2 className="h-4 w-4 text-destructive" />
										</Button>

										<div className="space-y-3 pr-8">
											<div className="grid grid-cols-2 gap-3">
												<div className="col-span-2">
													<Label className="text-xs">Product Title *</Label>
													<Input
														value={product.title}
														onChange={(e) =>
															updateProduct(index, 'title', e.target.value)
														}
														placeholder="Product name"
														className="h-9"
													/>
												</div>

												<div>
													<Label className="text-xs">Price *</Label>
													<Input
														type="number"
														value={product.price}
														onChange={(e) =>
															updateProduct(
																index,
																'price',
																parseFloat(e.target.value) || 0
															)
														}
														placeholder="0.00"
														step="0.01"
														className="h-9"
													/>
												</div>

												<div>
													<Label className="text-xs">Sale Price</Label>
													<Input
														type="number"
														value={product.salePrice}
														onChange={(e) =>
															updateProduct(
																index,
																'salePrice',
																parseFloat(e.target.value) || 0
															)
														}
														placeholder="0.00"
														step="0.01"
														className="h-9"
													/>
												</div>
											</div>

											<div className="flex items-center gap-3">
												<div className="flex-1">
													<Label className="text-xs">Quantity *</Label>
													<div className="flex items-center gap-2">
														<Button
															type="button"
															variant="outline"
															size="icon"
															className="h-9 w-9"
															onClick={() => updateQuantity(index, -1)}
															disabled={product.quantity <= 1}
														>
															<Minus className="h-3 w-3" />
														</Button>
														<Input
															type="number"
															value={product.quantity}
															onChange={(e) =>
																updateProduct(
																	index,
																	'quantity',
																	parseInt(e.target.value) || 1
																)
															}
															placeholder="1"
															min="1"
															className="h-9 text-center"
														/>
														<Button
															type="button"
															variant="outline"
															size="icon"
															className="h-9 w-9"
															onClick={() => updateQuantity(index, 1)}
														>
															<Plus className="h-3 w-3" />
														</Button>
													</div>
												</div>

												<div className="flex-1">
													<Label className="text-xs">Line Total</Label>
													<Input
														value={`৳${product.lineTotal.toFixed(2)}`}
														readOnly
														className="bg-muted h-9 font-semibold"
													/>
												</div>
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
					<CardHeader className="pb-3">
						<div className="flex items-center gap-2">
							<DollarSign className="h-4 w-4" />
							<CardTitle className="text-base">Financial Summary</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-3">
								<div className="col-span-2">
									<div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md">
										<span className="text-sm font-medium">Subtotal</span>
										<span className="text-sm font-semibold">৳{subTotal.toFixed(2)}</span>
									</div>
								</div>

								<div>
									<Label htmlFor="discount_amount" className="text-sm">Discount</Label>
									<Input
										id="discount_amount"
										type="number"
										{...register('discount_amount', { valueAsNumber: true })}
										placeholder="0.00"
										step="0.01"
										className="h-9"
									/>
								</div>

								<div>
									<Label htmlFor="delivery_cost" className="text-sm">Delivery Cost</Label>
									<Input
										id="delivery_cost"
										type="number"
										{...register('delivery_cost', { valueAsNumber: true })}
										placeholder="0.00"
										step="0.01"
										className="h-9"
									/>
								</div>

								<div className="col-span-2">
									<Separator className="my-2" />
									<div className="flex items-center justify-between py-2 px-3 bg-primary/10 rounded-md">
										<span className="text-sm font-semibold">Total Amount</span>
										<span className="text-lg font-bold text-primary">৳{orderAmount.toFixed(2)}</span>
									</div>
								</div>

								<div>
									<Label htmlFor="paid_amount" className="text-sm">Paid Amount</Label>
									<Input
										id="paid_amount"
										type="number"
										{...register('paid_amount', { valueAsNumber: true })}
										placeholder="0.00"
										step="0.01"
										className="h-9"
									/>
								</div>

								<div>
									<Label className="text-sm">Due Amount</Label>
									<Input
										value={`৳${dueAmount.toFixed(2)}`}
										readOnly
										className={cn(
											"bg-muted h-9 font-semibold",
											dueAmount > 0 ? "text-destructive" : "text-green-600"
										)}
									/>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Remark */}
				<Card>
					<CardHeader className="pb-3">
						<div className="flex items-center gap-2">
							<FileText className="h-4 w-4" />
							<CardTitle className="text-base">Additional Notes</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<Label htmlFor="remark" className="text-sm">Remark</Label>
						<Textarea
							id="remark"
							{...register('remark')}
							placeholder="Any additional notes about this order..."
							rows={3}
							className="resize-none"
						/>
					</CardContent>
				</Card>

				{/* Submit Button */}
				<div className="flex gap-3 sticky bottom-0 bg-background pt-4 pb-2 border-t">
					<Button
						type="submit"
						disabled={isSubmitting}
						className="flex-1"
						size="lg"
					>
						{isSubmitting ? 'Updating Order...' : 'Update Order'}
					</Button>
				</div>
			</form>
		</div>
	);
}
