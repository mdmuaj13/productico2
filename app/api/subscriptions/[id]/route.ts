import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';
import { updateSubscriptionSchema } from '@/lib/validations/subscription';
import { ApiSerializer } from '@/types';

// GET /api/subscriptions/[id] - Get single subscription
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		await dbConnect();

		const subscription = await Subscription.findOne({
			_id: params.id,
			deletedAt: null,
		}).lean();

		if (!subscription) {
			return ApiSerializer.notFound('Subscription not found');
		}

		return ApiSerializer.success(subscription, 'Subscription retrieved successfully');
	} catch (error) {
		console.error('Error fetching subscription:', error);
		return ApiSerializer.error('Failed to fetch subscription');
	}
}

// PUT /api/subscriptions/[id] - Update subscription
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		await dbConnect();

		const body = await request.json();

		const validation = updateSubscriptionSchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const subscription = await Subscription.findOneAndUpdate(
			{ _id: params.id, deletedAt: null },
			{ $set: validation.data },
			{ new: true, runValidators: true }
		);

		if (!subscription) {
			return ApiSerializer.notFound('Subscription not found');
		}

		return ApiSerializer.success(subscription, 'Subscription updated successfully');
	} catch (error) {
		console.error('Error updating subscription:', error);
		return ApiSerializer.error('Failed to update subscription');
	}
}

// DELETE /api/subscriptions/[id] - Soft delete subscription
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		await dbConnect();

		const subscription = await Subscription.findOneAndUpdate(
			{ _id: params.id, deletedAt: null },
			{ $set: { deletedAt: new Date() } },
			{ new: true }
		);

		if (!subscription) {
			return ApiSerializer.notFound('Subscription not found');
		}

		return ApiSerializer.success(null, 'Subscription deleted successfully');
	} catch (error) {
		console.error('Error deleting subscription:', error);
		return ApiSerializer.error('Failed to delete subscription');
	}
}
