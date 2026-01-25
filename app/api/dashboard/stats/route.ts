import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Vendor from '@/models/Vendor';
import Warehouse from '@/models/Warehouse';
import PurchaseOrder from '@/models/PurchaseOrder';
import Stock from '@/models/Stock';

export async function GET() {
	try {
		await connectDB();

		const [
			totalProducts,
			totalCategories,
			totalOrders,
			totalVendors,
			totalWarehouses,
			pendingPurchaseOrders,
			lastOrder,
			uniqueCustomers,
			lowStockAgg,
		] = await Promise.all([
			Product.countDocuments({ deletedAt: null }),
			Category.countDocuments({ deletedAt: null, isActive: true }),
			Order.countDocuments({ deletedAt: null }),
			Vendor.countDocuments({ deletedAt: null }),
			Warehouse.countDocuments({ deletedAt: null }),
			PurchaseOrder.countDocuments({ deletedAt: null, status: 'pending' }),
			Order.findOne({ deletedAt: null })
				.sort({ createdAt: -1 })
				.select('createdAt')
				.lean() as Promise<{ createdAt: Date } | null>,
			Order.aggregate([
				{ $match: { deletedAt: null } },
				{ $group: { _id: '$customerMobile' } },
				{ $count: 'total' },
			]),
			Stock.aggregate([
				{ $match: { deletedAt: null } },
				{
					$match: {
						$expr: {
							$lte: ['$quantity', { $ifNull: ['$reorderPoint', 10] }],
						},
					},
				},
				{ $count: 'total' },
			]),
		]);

		const totalCustomers = uniqueCustomers?.[0]?.total ?? 0;
		const lowStockItems = lowStockAgg?.[0]?.total ?? 0;

		return NextResponse.json({
			totalProducts,
			totalCategories,
			totalOrders,
			lastOrderDate: lastOrder?.createdAt || null,
			totalCustomers,
			totalVendors,
			totalWarehouses,
			pendingPurchaseOrders,
			lowStockItems,
		});
	} catch (error) {
		console.error('Error fetching dashboard stats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch dashboard stats' },
			{ status: 500 }
		);
	}
}
