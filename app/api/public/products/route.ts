import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { ApiSerializer } from '@/types';

export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const search = searchParams.get('search') || '';
		const categoryId = searchParams.get('categoryId') || '';

		const skip = (page - 1) * limit;

		const query: Record<string, unknown> = { deletedAt: null };

		if (search) {
			query.title = { $regex: search, $options: 'i' };
		}

		if (categoryId) {
			query.categoryId = categoryId;
		}

		const [products, total] = await Promise.all([
			Product.find(query)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.populate('categoryId', 'title slug')
				.lean(),
			Product.countDocuments(query),
		]);

		return ApiSerializer.success(products, 'Products retrieved successfully', {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		});
	} catch (error) {
		console.error('Failed to retrieve products:', error);
		return ApiSerializer.error('Failed to retrieve products');
	}
}
