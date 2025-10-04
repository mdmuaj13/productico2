import connectDB from '@/lib/db';
import Stock from '@/models/Stock';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { updateStockSchema } from '@/lib/validations/stock';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await connectDB();

		const { id } = await params;

		const stock = await Stock.findOne({ _id: id, deletedAt: null })
			.populate('productId', 'title slug thumbnail variants')
			.populate('warehouseId', 'title slug');

		if (!stock) {
			return ApiSerializer.error('Stock not found', 404);
		}

		return ApiSerializer.success(stock, 'Stock retrieved successfully');
	} catch {
		return ApiSerializer.error('Failed to retrieve stock');
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();

		const { id } = await params;
		const body = await request.json();

		const validation = updateStockSchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const stock = await Stock.findOne({ _id: id, deletedAt: null });

		if (!stock) {
			return ApiSerializer.error('Stock not found', 404);
		}

		const updatedStock = await Stock.findByIdAndUpdate(
			id,
			{ $set: validation.data },
			{ new: true }
		)
			.populate('productId', 'title slug thumbnail variants')
			.populate('warehouseId', 'title slug');

		return ApiSerializer.success(updatedStock, 'Stock updated successfully');
	} catch {
		return ApiSerializer.error('Failed to update stock');
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();

		const { id } = await params;

		const stock = await Stock.findOne({ _id: id, deletedAt: null });

		if (!stock) {
			return ApiSerializer.error('Stock not found', 404);
		}

		await Stock.findByIdAndUpdate(id, { deletedAt: new Date() });

		return ApiSerializer.success(null, 'Stock deleted successfully');
	} catch {
		return ApiSerializer.error('Failed to delete stock');
	}
}
