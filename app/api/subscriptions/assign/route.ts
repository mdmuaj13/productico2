import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import { assignSubscriptionSchema } from '@/lib/validations/subscription';
import { ZodError } from 'zod';

// POST /api/subscriptions/assign - Assign subscription to user
export async function POST(request: NextRequest) {
	try {
		await dbConnect();

		const body = await request.json();
		const validatedData = assignSubscriptionSchema.parse(body);

		// Verify subscription exists
		const subscription = await Subscription.findOne({
			_id: validatedData.subscriptionId,
			deletedAt: null,
		});

		if (!subscription) {
			return NextResponse.json(
				{ error: 'Subscription not found' },
				{ status: 404 }
			);
		}

		// Update user
		const user = await User.findOneAndUpdate(
			{ _id: validatedData.userId, deletedAt: null },
			{
				$set: {
					subscription: validatedData.subscriptionId,
					subscriptionOverride: validatedData.subscriptionOverride || null,
				},
			},
			{ new: true }
		).populate('subscription');

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		return NextResponse.json({
			message: 'Subscription assigned successfully',
			data: {
				userId: user._id,
				subscription: user.subscription,
				subscriptionOverride: user.subscriptionOverride,
			},
		});
	} catch (error) {
		console.error('Error assigning subscription:', error);

		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.issues },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{
				error: 'Failed to assign subscription',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
