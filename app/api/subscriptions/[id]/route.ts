import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';
import { updateSubscriptionSchema } from '@/lib/validations/subscription';
import { ZodError } from 'zod';

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
			return NextResponse.json(
				{ error: 'Subscription not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json(subscription);
	} catch (error) {
		console.error('Error fetching subscription:', error);
		return NextResponse.json(
			{
				error: 'Failed to fetch subscription',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
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
		const validatedData = updateSubscriptionSchema.parse(body);

		const subscription = await Subscription.findOneAndUpdate(
			{ _id: params.id, deletedAt: null },
			{ $set: validatedData },
			{ new: true, runValidators: true }
		);

		if (!subscription) {
			return NextResponse.json(
				{ error: 'Subscription not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json(subscription);
	} catch (error) {
		console.error('Error updating subscription:', error);

		if (error instanceof ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.issues },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{
				error: 'Failed to update subscription',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
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
			return NextResponse.json(
				{ error: 'Subscription not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: 'Subscription deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting subscription:', error);
		return NextResponse.json(
			{
				error: 'Failed to delete subscription',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
