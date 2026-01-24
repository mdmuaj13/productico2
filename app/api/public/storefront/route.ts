import connectDB from '@/lib/db';
import Storefront from '@/models/Storefront';
import { ApiSerializer } from '@/types';

export async function GET() {
	try {
		await connectDB();

		// Fetch all storefront data
		const storefronts = await Storefront.find({}).lean();

		// uncomment this to convert array to object keyed by type for easier access
		// const storefrontMap: Record<string, unknown> = {};

		// for (const item of storefronts) {
		// 	storefrontMap[item.type] = item;
		// }

		return ApiSerializer.success(storefronts, 'Storefront data retrieved successfully');
	} catch (error) {
		console.error('Failed to retrieve storefront:', error);
		return ApiSerializer.error('Failed to retrieve storefront data');
	}
}
