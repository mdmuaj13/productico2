import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import { assignSubscriptionSchema } from '@/lib/validations/subscription';
import { ApiSerializer } from '@/types';

// POST /api/subscriptions/assign - Assign subscription to user
export async function POST(request: NextRequest) {
	try {
		await dbConnect();

		const body = await request.json();

		const validation = assignSubscriptionSchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const validatedData = validation.data;

		// Verify subscription exists
		const subscription = await Subscription.findOne({
			_id: validatedData.subscriptionId,
			deletedAt: null,
		});

		if (!subscription) {
			return ApiSerializer.notFound('Subscription not found');
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
			return ApiSerializer.notFound('User not found');
		}

		const responseData = {
			userId: user._id,
			subscription: user.subscription,
			subscriptionOverride: user.subscriptionOverride,
		};

		return ApiSerializer.success(responseData, 'Subscription assigned successfully');
	} catch (error) {
		console.error('Error assigning subscription:', error);
		return ApiSerializer.error('Failed to assign subscription');
	}
}
