import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { createOrderSchema } from '@/lib/validations/order';

// Ensure User model is registered for populate
void User;

// GET /api/orders - List orders
export async function GET(request: NextRequest) {
	try {
		await dbConnect();

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const search = searchParams.get('search') || '';
		const status = searchParams.get('status') || '';
		const paymentStatus = searchParams.get('paymentStatus') || '';
		const sortBy = searchParams.get("sortBy") || "createdAt";
		const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

		const skip = (page - 1) * limit;

		// Build query
		const query: Record<string, unknown> = { deletedAt: null };

		if (search) {
			query.$or = [
				{ code: { $regex: search, $options: 'i' } },
				{ customerName: { $regex: search, $options: 'i' } },
				{ customerMobile: { $regex: search, $options: 'i' } },
			];
		}

		if (status) {
			query.status = status;
		}

		if (paymentStatus) {
			query.paymentStatus = paymentStatus;
		}

		const [orders, total] = await Promise.all([
			Order.find(query)
				.sort({ [sortBy]: sortOrder })
				.skip(skip)
				.limit(limit)
				.populate('createdById', 'name email')
				.lean(),
			Order.countDocuments(query),
		]);

		return NextResponse.json({
			data: orders,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error('Error fetching orders:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch orders' },
			{ status: 500 }
		);
	}
}

// POST /api/orders - Create order
export async function POST(request: NextRequest) {
	try {
		await dbConnect();

		const body = await request.json();

		// Validate with Zod
		const validationResult = createOrderSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Validation failed',
					details: validationResult.error.issues.map(err => ({
						field: err.path.join('.'),
						message: err.message
					}))
				},
				{ status: 400 }
			);
		}

		const validatedData = validationResult.data;

		// Check if order code already exists
		const existingOrder = await Order.findOne({ code: validatedData.code });
		if (existingOrder) {
			return NextResponse.json(
				{ error: 'Order code already exists' },
				{ status: 400 }
			);
		}

		// Calculate totals
		const subTotal = validatedData.products.reduce(
			(sum: number, product: { lineTotal: number }) => sum + product.lineTotal,
			0
		);

		const total = subTotal - validatedData.discount + validatedData.deliveryCost + validatedData.tax;
		const due = total - validatedData.paid;

		// Create order
		const order = await Order.create({
			customerName: validatedData.customerName,
			customerMobile: validatedData.customerMobile,
			customerEmail: validatedData.customerEmail,
			customerAddress: validatedData.customerAddress,
			customerDistrict: validatedData.customerDistrict,
			code: validatedData.code,
			trackingCode: validatedData.trackingCode,
			products: validatedData.products,
			subTotal,
			total,
			discount: validatedData.discount,
			deliveryCost: validatedData.deliveryCost,
			tax: validatedData.tax,
			paid: validatedData.paid,
			due,
			paymentStatus: validatedData.paymentStatus,
			paymentType: validatedData.paymentType,
			status: validatedData.status,
			remark: validatedData.remark,
			createdById: validatedData.createdById,
		});

		// Populate the created order
		const populatedOrder = await Order.findById(order._id)
			.populate('createdById', 'name email')
			.lean();

		return NextResponse.json(populatedOrder, { status: 201 });
	} catch (error: unknown) {
		console.error('Error creating order:', error);

		if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
			return NextResponse.json(
				{ error: 'Order code already exists' },
				{ status: 400 }
			);
		}

		const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
			? error.message
			: 'Unknown error';

		return NextResponse.json(
			{ error: 'Failed to create order', details: errorMessage },
			{ status: 500 }
		);
	}
}
