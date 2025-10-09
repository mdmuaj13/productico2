import connectDB from '@/lib/db';
import Stock from '@/models/Stock';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { z } from 'zod';

const adjustStockSchema = z.object({
	quantity: z.number().min(1, 'Quantity must be at least 1'),
	reason: z.string().min(1, 'Reason is required'),
});

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

		const validation = adjustStockSchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const stock = await Stock.findOne({ _id: id, deletedAt: null });

		if (!stock) {
			return ApiSerializer.error('Stock not found', 404);
		}

		const { quantity, reason } = validation.data;

		// Check if we have enough stock to deduct
		if (stock.quantity < quantity) {
			return ApiSerializer.error(
				`Insufficient stock. Current stock: ${stock.quantity}`,
				400
			);
		}

		// Deduct the stock
		const newQuantity = stock.quantity - quantity;

		// Update the stock
		const updatedStock = await Stock.findByIdAndUpdate(
			id,
			{
				$set: { quantity: newQuantity },
				$push: {
					adjustments: {
						quantity: -quantity,
						reason,
						adjustedAt: new Date(),
					},
				},
			},
			{ new: true }
		)
			.populate('productId', 'title slug thumbnail variants')
			.populate('warehouseId', 'title slug');

		return ApiSerializer.success(
			updatedStock,
			`Stock adjusted successfully. New quantity: ${newQuantity}`
		);
	} catch {
		return ApiSerializer.error('Failed to adjust stock');
	}
}
