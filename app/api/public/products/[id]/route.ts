import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await connectDB();
		const { id } = await params;

		const product = await Product.findOne({
			_id: id,
			deletedAt: null,
		}).populate('categoryId', 'name slug');

		if (!product) {
			return ApiSerializer.notFound('Product not found');
		}

		return ApiSerializer.success(product, 'Product retrieved successfully');
	} catch {
		return ApiSerializer.error('Failed to retrieve product');
	}
}

