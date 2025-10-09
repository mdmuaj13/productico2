import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

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

		const skip = (page - 1) * limit;

		// Build query
		const query: any = { deletedAt: null };

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
				.sort({ createdAt: -1 })
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

		// Validate required fields
		if (!body.customerName || !body.customerMobile || !body.customerAddress) {
			return NextResponse.json(
				{ error: 'Customer name, mobile, and address are required' },
				{ status: 400 }
			);
		}

		if (!body.products || body.products.length === 0) {
			return NextResponse.json(
				{ error: 'At least one product is required' },
				{ status: 400 }
			);
		}

		if (!body.code) {
			return NextResponse.json(
				{ error: 'Order code is required' },
				{ status: 400 }
			);
		}

		// Check if order code already exists
		const existingOrder = await Order.findOne({ code: body.code });
		if (existingOrder) {
			return NextResponse.json(
				{ error: 'Order code already exists' },
				{ status: 400 }
			);
		}

		// Calculate totals
		const subTotal = body.products.reduce(
			(sum: number, product: any) => sum + product.lineTotal,
			0
		);

		const total = subTotal - (body.discount || 0) + (body.deliveryCost || 0) + (body.tax || 0);
		const due = total - (body.paid || 0);

		// Create order
		const order = await Order.create({
			customerName: body.customerName,
			customerMobile: body.customerMobile,
			customerEmail: body.customerEmail,
			customerAddress: body.customerAddress,
			customerDistrict: body.customerDistrict,
			code: body.code,
			trackingCode: body.trackingCode,
			products: body.products,
			subTotal,
			total,
			discount: body.discount || 0,
			deliveryCost: body.deliveryCost || 0,
			tax: body.tax || 0,
			paid: body.paid || 0,
			due,
			paymentStatus: body.paymentStatus || 'unpaid',
			paymentType: body.paymentType || 'cash',
			status: body.status || 'pending',
			remark: body.remark,
			createdById: body.createdById,
		});

		// Populate the created order
		const populatedOrder = await Order.findById(order._id)
			.populate('createdById', 'name email')
			.lean();

		return NextResponse.json(populatedOrder, { status: 201 });
	} catch (error: any) {
		console.error('Error creating order:', error);

		if (error.code === 11000) {
			return NextResponse.json(
				{ error: 'Order code already exists' },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: 'Failed to create order', details: error.message },
			{ status: 500 }
		);
	}
}
