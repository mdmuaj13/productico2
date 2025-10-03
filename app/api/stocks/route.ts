import connectDB from '@/lib/db';
import Stock from '@/models/Stock';
import Product from '@/models/Product';
import Warehouse from '@/models/Warehouse';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { createStockSchema, createBulkStockSchema } from '@/lib/validations/stock';

export async function GET(request: NextRequest) {
	try {
		await connectDB();

		// Ensure models are registered
		void Product;
		void Warehouse;

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
			.populate('productId', 'title slug variants')
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
	} catch (e) {
		console.log(e);
		return ApiSerializer.error('Failed to retrieve stocks');
	}
}

export async function POST(request: NextRequest) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();

		// Ensure models are registered
		void Product;
		void Warehouse;

		const body = await request.json();

		// Check if it's a bulk operation (has variants array)
		const isBulk = Array.isArray(body.variants);

		if (isBulk) {
			// Bulk creation for multiple variants
			const validation = createBulkStockSchema.safeParse(body);
			if (!validation.success) {
				return ApiSerializer.error(validation.error.issues[0].message, 400);
			}

			const { productId, warehouseId, variants } = validation.data;

			// Filter out variants with 0 quantity
			const validVariants = variants.filter(v => v.quantity > 0);

			if (validVariants.length === 0) {
				return ApiSerializer.error('No variants with quantity greater than 0 to add', 400);
			}

			// Check for existing stocks for each variant
			const variantNames = validVariants.map(v => v.variantName || null);
			const existingStocks = await Stock.find({
				productId,
				warehouseId,
				$or: variantNames.map(vn => ({ variantName: vn })),
				deletedAt: null,
			});

			// Create a map of existing stocks by variantName
			const existingStockMap = new Map(
				existingStocks.map(s => [s.variantName, s])
			);

			const stocksToCreate = [];
			const stocksToUpdate = [];

			for (const variant of validVariants) {
				const variantName = variant.variantName || null;
				const existingStock = existingStockMap.get(variantName);

				if (existingStock) {
					// Update existing stock - increase quantity
					stocksToUpdate.push({
						stockId: existingStock._id,
						newQuantity: existingStock.quantity + variant.quantity,
						reorderPoint: variant.reorderPoint ?? existingStock.reorderPoint,
					});
				} else {
					// Create new stock
					stocksToCreate.push({
						productId,
						warehouseId,
						variantName,
						quantity: variant.quantity,
						reorderPoint: variant.reorderPoint ?? 0,
					});
				}
			}

			// Perform updates
			for (const update of stocksToUpdate) {
				await Stock.findByIdAndUpdate(update.stockId, {
					quantity: update.newQuantity,
					reorderPoint: update.reorderPoint,
				});
			}

			// Perform creations
			let createdStocks = [];
			if (stocksToCreate.length > 0) {
				createdStocks = await Stock.insertMany(stocksToCreate);
			}

			// Get all affected stock IDs
			const allStockIds = [
				...stocksToUpdate.map(u => u.stockId),
				...createdStocks.map(s => s._id),
			];

			const populatedStocks = await Stock.find({
				_id: { $in: allStockIds }
			})
				.populate('productId', 'title slug thumbnail variants')
				.populate('warehouseId', 'title slug');

			const message = `${stocksToUpdate.length} stock(s) updated, ${createdStocks.length} stock(s) created`;
			return ApiSerializer.success(populatedStocks, message);
		} else {
			// Single stock creation
			const validation = createStockSchema.safeParse(body);
			if (!validation.success) {
				return ApiSerializer.error(validation.error.issues[0].message, 400);
			}

			const { productId, variantName, warehouseId, quantity, reorderPoint } = validation.data;

			// Skip if quantity is 0
			if (quantity === 0) {
				return ApiSerializer.error('Cannot add stock with quantity 0', 400);
			}

			// Check if stock already exists for this product/variant/warehouse combination
			const existingStock = await Stock.findOne({
				productId,
				variantName: variantName || null,
				warehouseId,
				deletedAt: null,
			});

			if (existingStock) {
				// Update existing stock - increase quantity
				existingStock.quantity += quantity;
				if (reorderPoint !== undefined) {
					existingStock.reorderPoint = reorderPoint;
				}
				await existingStock.save();

				const populatedStock = await Stock.findById(existingStock._id)
					.populate('productId', 'title slug thumbnail variants')
					.populate('warehouseId', 'title slug');

				return ApiSerializer.success(populatedStock, 'Stock updated successfully');
			}

			const stock = await Stock.create({
				productId,
				variantName: variantName || null,
				warehouseId,
				quantity,
				reorderPoint: reorderPoint ?? 0,
			});

			const populatedStock = await Stock.findById(stock._id)
				.populate('productId', 'title slug thumbnail variants')
				.populate('warehouseId', 'title slug');

			return ApiSerializer.created(populatedStock, 'Stock created successfully');
		}
	} catch {
		return ApiSerializer.error('Failed to create stock');
	}
}
