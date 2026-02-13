import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Discount from '@/models/Discount';
import { publicOrderSchema } from '@/lib/validations/publicOrder';
import { ApiSerializer } from '@/types';

function generateOrderCode() {
	return `ORD-${Date.now()}`;
}

function generateTrackingCode() {
	return `TRK-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`.toUpperCase();
}

export async function POST(request: NextRequest) {
	try {
		await connectDB();

		const body = await request.json();

		// 1. Validate input shape
		const validation = publicOrderSchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(
				validation.error.issues
					.map((e) => `${e.path.join('.')}: ${e.message}`)
					.join('; '),
				400,
			);
		}

		const { items, discountCode, name, email, phone, address, city } =
			validation.data;

		// 2. Fetch all products from DB in one query
		const productIds = items.map((item) => item.productId);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const dbProducts: any[] = await Product.find({
			_id: { $in: productIds },
			deletedAt: null,
		}).lean();

		// Build a map for quick lookup
		const productMap = new Map<string, any>();
		for (const p of dbProducts) {
			productMap.set(p._id.toString(), p);
		}

		// 3. Verify each item and build order products
		const orderProducts = [];

		for (const item of items) {
			const product = productMap.get(item.productId);
			if (!product) {
				return ApiSerializer.error(`Product not found: ${item.productId}`, 400);
			}

			let finalPrice = (product as any).salePrice ?? product.price;
			let variantPrice: number | null = null;
			let variantSalePrice: number | null = null;
			let variantName: string | null = null;

			// If variant requested, find it
			if (item.variantName) {
				const variant = product.variants?.find(
					(v: any) => v.name.toLowerCase() === item.variantName!.toLowerCase(),
				);
				if (!variant) {
					return ApiSerializer.error(
						`Variant "${item.variantName}" not found for product "${product.title}"`,
						400,
					);
				}
				variantName = variant.name;
				variantPrice = variant.price;
				variantSalePrice = variant.salePrice ?? null;
				finalPrice = variant.salePrice ?? variant.price;
			}

			const lineTotal = finalPrice * item.quantity;

			orderProducts.push({
				_id: product._id,
				slug: product.slug || '',
				title: product.title,
				thumbnail: product.thumbnail || '',
				basePrice: product.price,
				price: finalPrice,
				quantity: item.quantity,
				variantName,
				variantPrice,
				variantSalePrice,
				warehouseId: null,
				lineTotal,
			});
		}

		// 4. Calculate totals
		let subTotal = orderProducts.reduce((sum, p) => sum + p.lineTotal, 0);
		subTotal = Number(subTotal.toFixed(2));

		let discountAmount = 0;
		if (discountCode) {
			const discountDoc = await Discount.findOne({
				code: discountCode.toUpperCase(),
				isActive: true,
				deletedAt: null,
			});

			if (!discountDoc) {
				return ApiSerializer.error('Invalid or expired discount code', 400);
			}

			// Validate dates
			const now = new Date();
			if (discountDoc.startDate && now < discountDoc.startDate) {
				return ApiSerializer.error('Discount code is not yet active', 400);
			}
			if (discountDoc.endDate && now > discountDoc.endDate) {
				return ApiSerializer.error('Discount code has expired', 400);
			}

			// Validate usage
			if (
				discountDoc.maxUses !== null &&
				discountDoc.usedCount >= discountDoc.maxUses
			) {
				return ApiSerializer.error(
					'Discount code usage limit has been reached',
					400,
				);
			}

			// Validate min order amount
			if (subTotal < discountDoc.minOrderAmount) {
				return ApiSerializer.error(
					`Minimum order amount for this discount is ${discountDoc.minOrderAmount}`,
					400,
				);
			}

			// Calculate discount
			if (discountDoc.type === 'percentage') {
				discountAmount = (subTotal * discountDoc.value) / 100;
			} else {
				discountAmount = discountDoc.value;
			}

			// Ensure discount doesn't exceed subtotal
			discountAmount = Math.min(discountAmount, subTotal);
			discountAmount = Number(discountAmount.toFixed(2));
		}

		const deliveryCost = 0;
		const tax = 0;
		const total = Number(
			(subTotal - discountAmount + deliveryCost + tax).toFixed(2),
		);
		const paid = 0;
		const due = total - paid;

		// 5. Build remark with discount code if provided
		const remark = discountCode ? `Discount code: ${discountCode}` : '';

		// 6. Create order
		const order = await Order.create({
			customerName: name,
			customerMobile: phone,
			customerEmail: email,
			customerAddress: address,
			customerDistrict: city,
			code: generateOrderCode(),
			trackingCode: generateTrackingCode(),
			products: orderProducts,
			subTotal,
			total,
			discount: discountAmount,
			deliveryCost,
			tax,
			paid,
			due,
			paymentStatus: 'unpaid',
			paymentType: 'cash',
			status: 'pending',
			remark,
		});

		// 7. Increment discount usage if applicable
		if (discountCode) {
			await Discount.findOneAndUpdate(
				{ code: discountCode.toUpperCase(), deletedAt: null },
				{ $inc: { usedCount: 1 } },
			);
		}

		const populatedOrder = await Order.findById(order._id).lean();

		return ApiSerializer.created(populatedOrder, 'Order placed successfully');
	} catch (error: unknown) {
		console.error('Error creating public order:', error);

		if (
			error &&
			typeof error === 'object' &&
			'code' in error &&
			error.code === 11000
		) {
			return ApiSerializer.error('Order code conflict, please try again', 400);
		}

		return ApiSerializer.error('Failed to place order');
	}
}
