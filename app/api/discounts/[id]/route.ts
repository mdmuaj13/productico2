import connectDB from '@/lib/db';
import Discount from '@/models/Discount';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { updateDiscountSchema } from '@/lib/validations/discount';

// GET /api/discounts/[id]
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		await connectDB();
		const { id } = await params;

		const discount = await Discount.findOne({
			_id: id,
			deletedAt: null,
		});

		if (!discount) {
			return ApiSerializer.notFound('Discount not found');
		}

		return ApiSerializer.success(discount, 'Discount retrieved successfully');
	} catch (error) {
		console.error('Error fetching discount:', error);
		return ApiSerializer.error('Failed to fetch discount');
	}
}

// PUT /api/discounts/[id]
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();
		const { id } = await params;

		const body = await request.json();

		const validation = updateDiscountSchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const updateData = validation.data;

		// Check for duplicate code
		if (updateData.code) {
			const existingDiscount = await Discount.findOne({
				_id: { $ne: id },
				code: updateData.code,
				deletedAt: null,
			});

			if (existingDiscount) {
				return ApiSerializer.error(
					'Another discount with this code already exists',
					409,
				);
			}
		}

		const discount = await Discount.findOneAndUpdate(
			{ _id: id, deletedAt: null },
			{ $set: updateData },
			{ new: true, runValidators: true },
		);

		if (!discount) {
			return ApiSerializer.notFound('Discount not found');
		}

		return ApiSerializer.success(discount, 'Discount updated successfully');
	} catch {
		return ApiSerializer.error('Failed to update discount');
	}
}

// DELETE /api/discounts/[id]
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();
		const { id } = await params;

		const discount = await Discount.findOneAndUpdate(
			{ _id: id, deletedAt: null },
			{ $set: { deletedAt: new Date() } },
			{ new: true },
		);

		if (!discount) {
			return ApiSerializer.notFound('Discount not found');
		}

		return ApiSerializer.success(null, 'Discount deleted successfully');
	} catch {
		return ApiSerializer.error('Failed to delete discount');
	}
}
