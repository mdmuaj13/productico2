import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';
import { createSubscriptionSchema } from '@/lib/validations/subscription';
import { ZodError } from 'zod';

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

		return NextResponse.json({
			data: subscriptions,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error('Error fetching subscriptions:', error);
		return NextResponse.json(
			{
				error: 'Failed to fetch subscriptions',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

// POST /api/subscriptions - Create new subscription plan
export async function POST(request: NextRequest) {
	try {
		await dbConnect();

		const body = await request.json();
		const validatedData = createSubscriptionSchema.parse(body);

		const subscription = await Subscription.create(validatedData);

		return NextResponse.json(subscription, { status: 201 });
	} catch (error) {
		console.error('Error creating subscription:', error);

		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.issues },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{
				error: 'Failed to create subscription',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
