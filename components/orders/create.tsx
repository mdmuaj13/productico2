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
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { OrderFormData, OrderProduct } from '@/types/order';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface OrderFormProps {
	onSuccess: () => void;
}

export function OrderForm({ onSuccess }: OrderFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [products, setProducts] = useState<OrderProduct[]>([]);
	const [orderDate, setOrderDate] = useState(
		new Date().toISOString().split('T')[0]
	);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
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

	const updateProduct = (index: number, field: keyof OrderProduct, value: any) => {
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

		const orderData: OrderFormData = {
			...data,
			products,
			order_amount: orderAmount,
			due_amount: dueAmount,
		};

		try {
			// TODO: Implement API call when backend is ready
			console.log('Order data:', orderData);
			toast.success('Order created successfully');
			onSuccess();
		} catch (error) {
			toast.error('Failed to create order');
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="h-full overflow-y-auto">
			<SheetHeader className="mb-6">
				<SheetTitle>Create New Order</SheetTitle>
			</SheetHeader>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{/* Customer Information */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Customer Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="name">
								Name <span className="text-red-500">*</span>
							</Label>
							<Input
								id="name"
								{...register('name', { required: 'Name is required' })}
								placeholder="Customer name"
							/>
							{errors.name && (
								<p className="text-sm text-red-500 mt-1">
									{errors.name.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="contact_number">
								Contact Number <span className="text-red-500">*</span>
							</Label>
							<Input
								id="contact_number"
								{...register('contact_number', {
									required: 'Contact number is required',
								})}
								placeholder="Phone number"
							/>
							{errors.contact_number && (
								<p className="text-sm text-red-500 mt-1">
									{errors.contact_number.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								{...register('email')}
								placeholder="customer@example.com"
							/>
						</div>

						<div>
							<Label htmlFor="address">
								Address <span className="text-red-500">*</span>
							</Label>
							<Textarea
								id="address"
								{...register('address', { required: 'Address is required' })}
								placeholder="Delivery address"
								rows={3}
							/>
							{errors.address && (
								<p className="text-sm text-red-500 mt-1">
									{errors.address.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="city">
								City <span className="text-red-500">*</span>
							</Label>
							<Input
								id="city"
								{...register('city', { required: 'City is required' })}
								placeholder="City"
							/>
							{errors.city && (
								<p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Order Details */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Order Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="order_code">Order Code</Label>
								<Input id="order_code" {...register('order_code')} readOnly />
							</div>

							<div>
								<Label htmlFor="order_date">Order Date</Label>
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

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="order_status">Order Status</Label>
								<Select
									onValueChange={(value) =>
										setValue(
											'order_status',
											value as OrderFormData['order_status']
										)
									}
									defaultValue="pending"
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
								<Label htmlFor="order_payment_status">Payment Status</Label>
								<Select
									onValueChange={(value) =>
										setValue(
											'order_payment_status',
											value as OrderFormData['order_payment_status']
										)
									}
									defaultValue="unpaid"
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
					</CardContent>
				</Card>

				{/* Products */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">Products</CardTitle>
							<Button type="button" onClick={addProduct} size="sm">
								<Plus className="h-4 w-4 mr-2" />
								Add Product
							</Button>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						{products.length === 0 ? (
							<p className="text-center text-muted-foreground py-4">
								No products added yet
							</p>
						) : (
							products.map((product, index) => (
								<div
									key={product.id}
									className="border rounded-lg p-4 space-y-3 relative"
								>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute top-2 right-2"
										onClick={() => removeProduct(index)}
									>
										<Trash2 className="h-4 w-4 text-red-500" />
									</Button>

									<div className="grid grid-cols-2 gap-3">
										<div className="col-span-2">
											<Label>Product Title *</Label>
											<Input
												value={product.title}
												onChange={(e) =>
													updateProduct(index, 'title', e.target.value)
												}
												placeholder="Product name"
											/>
										</div>

										<div>
											<Label>Slug</Label>
											<Input
												value={product.slug}
												onChange={(e) =>
													updateProduct(index, 'slug', e.target.value)
												}
												placeholder="product-slug"
											/>
										</div>

										<div>
											<Label>Price *</Label>
											<Input
												type="number"
												value={product.price}
												onChange={(e) =>
													updateProduct(index, 'price', parseFloat(e.target.value) || 0)
												}
												placeholder="0.00"
												step="0.01"
											/>
										</div>

										<div>
											<Label>Sale Price</Label>
											<Input
												type="number"
												value={product.salePrice}
												onChange={(e) =>
													updateProduct(index, 'salePrice', parseFloat(e.target.value) || 0)
												}
												placeholder="0.00"
												step="0.01"
											/>
										</div>

										<div>
											<Label>Quantity *</Label>
											<Input
												type="number"
												value={product.quantity}
												onChange={(e) =>
													updateProduct(index, 'quantity', parseInt(e.target.value) || 1)
												}
												placeholder="1"
												min="1"
											/>
										</div>

										<div className="col-span-2">
											<Label>Line Total</Label>
											<Input
												value={product.lineTotal.toFixed(2)}
												readOnly
												className="bg-muted"
											/>
										</div>
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>

				{/* Financial Summary */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Financial Summary</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label>Subtotal</Label>
								<Input value={subTotal.toFixed(2)} readOnly className="bg-muted" />
							</div>

							<div>
								<Label htmlFor="discount_code">Discount Code</Label>
								<Input
									id="discount_code"
									{...register('discount_code')}
									placeholder="DISCOUNT10"
								/>
							</div>

							<div>
								<Label htmlFor="discount_amount">Discount Amount</Label>
								<Input
									id="discount_amount"
									type="number"
									{...register('discount_amount', { valueAsNumber: true })}
									placeholder="0.00"
									step="0.01"
								/>
							</div>

							<div>
								<Label htmlFor="delivery_cost">Delivery Cost</Label>
								<Input
									id="delivery_cost"
									type="number"
									{...register('delivery_cost', { valueAsNumber: true })}
									placeholder="0.00"
									step="0.01"
								/>
							</div>

							<div>
								<Label>Order Amount</Label>
								<Input
									value={orderAmount.toFixed(2)}
									readOnly
									className="bg-muted font-semibold"
								/>
							</div>

							<div>
								<Label htmlFor="paid_amount">Paid Amount</Label>
								<Input
									id="paid_amount"
									type="number"
									{...register('paid_amount', { valueAsNumber: true })}
									placeholder="0.00"
									step="0.01"
								/>
							</div>

							<div>
								<Label>Due Amount</Label>
								<Input
									value={dueAmount.toFixed(2)}
									readOnly
									className="bg-muted font-semibold"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Remark */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Additional Notes</CardTitle>
					</CardHeader>
					<CardContent>
						<Label htmlFor="remark">Remark</Label>
						<Textarea
							id="remark"
							{...register('remark')}
							placeholder="Any additional notes..."
							rows={3}
						/>
					</CardContent>
				</Card>

				{/* Submit Button */}
				<div className="flex gap-2">
					<Button type="submit" disabled={isSubmitting} className="flex-1">
						{isSubmitting ? 'Creating...' : 'Create Order'}
					</Button>
				</div>
			</form>
		</div>
	);
}
