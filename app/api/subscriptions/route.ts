import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';
import { createSubscriptionSchema } from '@/lib/validations/subscription';
import { ApiSerializer } from '@/types';

// GET /api/subscriptions - Get all subscription plans
export async function GET(request: NextRequest) {
	try {
		await dbConnect();

		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '100');
		const search = searchParams.get('search') || '';
		const isActive = searchParams.get('isActive');

		const skip = (page - 1) * limit;

		// Build query
		const query: Record<string, unknown> = { deletedAt: null };

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ displayName: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
			];
		}

		if (isActive !== null && isActive !== undefined) {
			query.isActive = isActive === 'true';
		}

		// Get total count
		const total = await Subscription.countDocuments(query);

		// Get subscriptions
		const subscriptions = await Subscription.find(query)
			.sort({ sortOrder: 1, createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();

		const meta = {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};

		return ApiSerializer.success(subscriptions, 'Subscriptions retrieved successfully', meta);
	} catch (error) {
		console.error('Error fetching subscriptions:', error);
		return ApiSerializer.error('Failed to fetch subscriptions');
	}
}

// POST /api/subscriptions - Create new subscription plan
export async function POST(request: NextRequest) {
	try {
		await dbConnect();

		const body = await request.json();

		const validation = createSubscriptionSchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const subscription = await Subscription.create(validation.data);

		return ApiSerializer.created(subscription, 'Subscription created successfully');
	} catch (error) {
		console.error('Error creating subscription:', error);
		return ApiSerializer.error('Failed to create subscription');
	}
}
