import mongoose from 'mongoose';
import Stock from '@/models/Stock';
import StockMovement from '@/models/StockMovement';
import Product from '@/models/Product';

/**
 * Recalculate and update Product.totalStock from Stock collection
 */
export async function syncProductTotalStock(productId: string | mongoose.Types.ObjectId): Promise<number> {
	const result = await Stock.aggregate([
		{
			$match: {
				productId: new mongoose.Types.ObjectId(productId.toString()),
				deletedAt: null,
			},
		},
		{
			$group: {
				_id: null,
				totalStock: { $sum: '$quantity' },
			},
		},
	]);

	const totalStock = result[0]?.totalStock || 0;

	await Product.findByIdAndUpdate(productId, { totalStock });

	return totalStock;
}

/**
 * Adjust stock quantity and create a movement record
 */
export async function adjustStockWithMovement({
	stockId,
	operation,
	quantity,
	notes,
	createdBy,
}: {
	stockId: string;
	operation: 'add' | 'deduct';
	quantity: number;
	notes?: string;
	createdBy?: string;
}): Promise<{ stock: typeof Stock.prototype; movement: typeof StockMovement.prototype }> {
	const stock = await Stock.findById(stockId);
	if (!stock) {
		throw new Error('Stock not found');
	}

	const previousQuantity = stock.quantity;
	const adjustedQuantity = operation === 'add' ? quantity : -quantity;
	const newQuantity = Math.max(0, previousQuantity + adjustedQuantity);

	// Update stock
	stock.quantity = newQuantity;
	await stock.save();

	// Create movement record
	const movement = await StockMovement.create({
		productId: stock.productId,
		variantName: stock.variantName,
		warehouseId: stock.warehouseId,
		type: 'adjustment',
		quantity: adjustedQuantity,
		previousQuantity,
		newQuantity,
		notes: notes || `Stock ${operation}: ${quantity} units`,
		createdBy: createdBy ? new mongoose.Types.ObjectId(createdBy) : undefined,
	});

	// Sync product total stock
	await syncProductTotalStock(stock.productId);

	return { stock, movement };
}

/**
 * Get aggregated stock summary for all products
 */
export async function getProductStockSummary() {
	const stocks = await Stock.aggregate([
		{ $match: { deletedAt: null } },
		{
			$lookup: {
				from: 'products',
				localField: 'productId',
				foreignField: '_id',
				as: 'product',
			},
		},
		{ $unwind: '$product' },
		{ $match: { 'product.deletedAt': null } },
		{
			$lookup: {
				from: 'warehouses',
				localField: 'warehouseId',
				foreignField: '_id',
				as: 'warehouse',
			},
		},
		{ $unwind: '$warehouse' },
		{
			$group: {
				_id: {
					productId: '$productId',
					variantName: '$variantName',
				},
				product: { $first: '$product' },
				variantTotalStock: { $sum: '$quantity' },
				warehouses: {
					$push: {
						stockId: '$_id',
						warehouseId: '$warehouseId',
						warehouseName: '$warehouse.title',
						quantity: '$quantity',
						reorderPoint: '$reorderPoint',
						isLowStock: { $lte: ['$quantity', '$reorderPoint'] },
					},
				},
			},
		},
		{
			$group: {
				_id: '$_id.productId',
				product: { $first: '$product' },
				totalStock: { $sum: '$variantTotalStock' },
				variants: {
					$push: {
						variantName: '$_id.variantName',
						totalStock: '$variantTotalStock',
						warehouses: '$warehouses',
					},
				},
			},
		},
		{
			$addFields: {
				variantCount: { $size: '$variants' },
				warehouseCount: {
					$size: {
						$reduce: {
							input: '$variants',
							initialValue: [],
							in: { $setUnion: ['$$value', '$$this.warehouses.warehouseId'] },
						},
					},
				},
				hasLowStock: {
					$anyElementTrue: {
						$map: {
							input: '$variants',
							as: 'v',
							in: {
								$anyElementTrue: {
									$map: {
										input: '$$v.warehouses',
										as: 'w',
										in: '$$w.isLowStock',
									},
								},
							},
						},
					},
				},
				hasOutOfStock: {
					$anyElementTrue: {
						$map: {
							input: '$variants',
							as: 'v',
							in: {
								$anyElementTrue: {
									$map: {
										input: '$$v.warehouses',
										as: 'w',
										in: { $eq: ['$$w.quantity', 0] },
									},
								},
							},
						},
					},
				},
			},
		},
		{
			$project: {
				_id: 0,
				productId: '$_id',
				product: {
					_id: '$product._id',
					title: '$product.title',
					thumbnail: '$product.thumbnail',
					variants: '$product.variants',
				},
				totalStock: 1,
				variantCount: 1,
				warehouseCount: 1,
				hasLowStock: 1,
				hasOutOfStock: 1,
				variants: 1,
			},
		},
		{ $sort: { 'product.title': 1 } },
	]);

	return stocks;
}

/**
 * Get stock summary stats
 */
export async function getStockStats() {
	const summary = await getProductStockSummary();

	return {
		totalProducts: summary.length,
		lowStockCount: summary.filter((s) => s.hasLowStock).length,
		outOfStockCount: summary.filter((s) => s.hasOutOfStock).length,
	};
}
