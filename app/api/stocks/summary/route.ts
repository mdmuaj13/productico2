import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getProductStockSummary, getStockStats } from '@/lib/stock-utils';

export async function GET() {
	try {
		await connectDB();

		const [summary, stats] = await Promise.all([
			getProductStockSummary(),
			getStockStats(),
		]);

		return NextResponse.json({
			statusCode: 200,
			message: 'Stock summary retrieved successfully',
			data: {
				products: summary,
				stats,
			},
		});
	} catch (error) {
		console.error('Error fetching stock summary:', error);
		return NextResponse.json(
			{
				statusCode: 500,
				message: 'Failed to fetch stock summary',
				data: null,
			},
			{ status: 500 }
		);
	}
}
