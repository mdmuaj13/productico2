import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';

export async function GET() {
	try {
		await connectDB();

		// Get total products (excluding deleted)
		const totalProducts = await Product.countDocuments({ deletedAt: null });

		// Get total orders (excluding deleted)
		const totalOrders = await Order.countDocuments({ deletedAt: null });

		// Get last order date
		const lastOrder = await Order.findOne({ deletedAt: null })
			.sort({ createdAt: -1 })
			.select('createdAt')
			.lean();

		// Get unique customers count based on customer mobile
		const uniqueCustomers = await Order.aggregate([
			{ $match: { deletedAt: null } },
			{ $group: { _id: '$customerMobile' } },
			{ $count: 'total' }
		]);

		const totalCustomers = uniqueCustomers.length > 0 ? uniqueCustomers[0].total : 0;

		return NextResponse.json({
			totalProducts,
			totalOrders,
			lastOrderDate: lastOrder?.createdAt || null,
			totalCustomers,
		});
	} catch (error) {
		console.error('Error fetching dashboard stats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch dashboard stats' },
			{ status: 500 }
		);
	}
}
