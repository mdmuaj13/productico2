import connectDB from '@/lib/db';
import Stock from '@/models/Stock';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { createStockSchema } from '@/lib/validations/stock';

export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const productId = searchParams.get('productId');
		const warehouseId = searchParams.get('warehouseId');

		const skip = (page - 1) * limit;

		const query: Record<string, unknown> = { deletedAt: null };

		if (productId) {
			query.productId = productId;
		}

		if (warehouseId) {
			query.warehouseId = warehouseId;
		}

		const stocks = await Stock.find(query)
			.populate('productId', 'title slug thumbnail variants')
			.populate('warehouseId', 'title slug')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const total = await Stock.countDocuments(query);

		const meta = {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};

		return ApiSerializer.success(stocks, 'Stocks retrieved successfully', meta);
	} catch {
		return ApiSerializer.error('Failed to retrieve stocks');
	}
}

export async function POST(request: NextRequest) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();

		const body = await request.json();

		const validation = createStockSchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const { productId, variantName, warehouseId, quantity, reorderPoint } = validation.data;

		// Check if stock already exists for this product/variant/warehouse combination
		const existingStock = await Stock.findOne({
			productId,
			variantName: variantName || null,
			warehouseId,
			deletedAt: null,
		});

		if (existingStock) {
			return ApiSerializer.error('Stock already exists for this product/variant in this warehouse', 409);
		}

		const stock = await Stock.create({
			productId,
			variantName: variantName || null,
			warehouseId,
			quantity,
			reorderPoint,
		});

		const populatedStock = await Stock.findById(stock._id)
			.populate('productId', 'title slug thumbnail variants')
			.populate('warehouseId', 'title slug');

		return ApiSerializer.created(populatedStock, 'Stock created successfully');
	} catch {
		return ApiSerializer.error('Failed to create stock');
	}
}
