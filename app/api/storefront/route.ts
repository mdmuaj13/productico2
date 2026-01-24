import connectDB from '@/lib/db';
import Storefront from '@/models/Storefront';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { storefrontSchema } from '@/lib/validations/storefront';

export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const searchParams = request.nextUrl.searchParams;
		const type = searchParams.get('type') || 'default';

		const storefront = await Storefront.findOne({ type }).lean();

		if (!storefront) {
			return ApiSerializer.notFound('Storefront not found');
		}

		return ApiSerializer.success(storefront, 'Storefront retrieved successfully');
	} catch {
		return ApiSerializer.error('Failed to retrieve storefront');
	}
}

export async function POST(request: NextRequest) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();

		const body = await request.json();

		const validation = storefrontSchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const { type, value } = validation.data;

		// Upsert: Insert if type is unique, update if type exists
		const storefront = await Storefront.findOneAndUpdate(
			{ type },
			{ value },
			{ new: true, upsert: true }
		);

		return ApiSerializer.created(storefront, 'Storefront saved successfully');
	} catch {
		return ApiSerializer.error('Failed to save storefront');
	}
}

export async function PUT(request: NextRequest) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();

		const body = await request.json();

		const validation = storefrontSchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const { type, value } = validation.data;

		const storefront = await Storefront.findOneAndUpdate(
			{ type },
			{ value },
			{ new: true, upsert: true }
		);

		return ApiSerializer.success(storefront, 'Storefront updated successfully');
	} catch {
		return ApiSerializer.error('Failed to update storefront');
	}
}
