import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { createOrderSchema } from '@/lib/validations/order';

// Ensure User model is registered for populate
void User;

// GET /api/orders/[id] - Get single order
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await dbConnect();

		const order = await Order.findById(id)
			.populate('createdById', 'name email')
			.lean();

		if (!order) {
			return NextResponse.json(
				{ error: 'Order not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json(order);
	} catch (error) {
		console.error('Error fetching order:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch order' },
			{ status: 500 }
		);
	}
}

// PUT /api/orders/[id] - Update order
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await dbConnect();

		const body = await request.json();

		// Validate with Zod (partial validation for updates)
		const validationResult = createOrderSchema.partial().safeParse(body);

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

		// Calculate totals if products are provided
		let updateData: Record<string, unknown> = { ...validatedData };

		if (validatedData.products && validatedData.products.length > 0) {
			const subTotal = validatedData.products.reduce(
				(sum: number, product: { lineTotal: number }) => sum + product.lineTotal,
				0
			);

			const total = subTotal - (validatedData.discount || 0) + (validatedData.deliveryCost || 0) + (validatedData.tax || 0);
			const due = total - (validatedData.paid || 0);

			updateData = {
				...updateData,
				subTotal,
				total,
				due,
			};
		}

		const order = await Order.findByIdAndUpdate(
			id,
			updateData,
			{ new: true, runValidators: true }
		).populate('createdById', 'name email');

		if (!order) {
			return NextResponse.json(
				{ error: 'Order not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json(order);
	} catch (error: unknown) {
		console.error('Error updating order:', error);

		const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
			? error.message
			: 'Unknown error';

		return NextResponse.json(
			{ error: 'Failed to update order', details: errorMessage },
			{ status: 500 }
		);
	}
}

// DELETE /api/orders/[id] - Delete order (soft delete)
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await dbConnect();

		const order = await Order.findByIdAndUpdate(
			id,
			{ deletedAt: new Date() },
			{ new: true }
		);

		if (!order) {
			return NextResponse.json(
				{ error: 'Order not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({ message: 'Order deleted successfully' });
	} catch (error) {
		console.error('Error deleting order:', error);
		return NextResponse.json(
			{ error: 'Failed to delete order' },
			{ status: 500 }
		);
	}
}
