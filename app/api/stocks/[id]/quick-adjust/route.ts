import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { adjustStockWithMovement } from '@/lib/stock-utils';
import { z } from 'zod';

const quickAdjustSchema = z.object({
	operation: z.enum(['add', 'deduct']),
	quantity: z.number().positive('Quantity must be positive'),
	notes: z.string().optional(),
});

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await connectDB();
		const { id } = await params;
		const body = await request.json();

		const validation = quickAdjustSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{
					statusCode: 400,
					message: 'Validation error',
					data: validation.error.flatten().fieldErrors,
				},
				{ status: 400 }
			);
		}

		const { operation, quantity, notes } = validation.data;

		const result = await adjustStockWithMovement({
			stockId: id,
			operation,
			quantity,
			notes,
		});

		return NextResponse.json({
			statusCode: 200,
			message: `Stock ${operation === 'add' ? 'increased' : 'decreased'} successfully`,
			data: {
				stock: result.stock,
				movement: result.movement,
			},
		});
	} catch (error) {
		console.error('Error adjusting stock:', error);
		return NextResponse.json(
			{
				statusCode: 500,
				message: error instanceof Error ? error.message : 'Failed to adjust stock',
				data: null,
			},
			{ status: 500 }
		);
	}
}
