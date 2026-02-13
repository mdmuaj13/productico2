import connectDB from '@/lib/db';
import Discount from '@/models/Discount';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { createDiscountSchema } from '@/lib/validations/discount';

export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const search = searchParams.get('search') || '';
		const isActive = searchParams.get('isActive');

		const skip = (page - 1) * limit;

		const query: Record<string, unknown> = { deletedAt: null };

		if (search) {
			query.$or = [{ code: { $regex: search, $options: 'i' } }];
		}

		if (isActive !== null) {
			query.isActive = isActive === 'true';
		}

		const discounts = await Discount.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const total = await Discount.countDocuments(query);

		const meta = {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};

		return ApiSerializer.success(
			discounts,
			'Discounts retrieved successfully',
			meta,
		);
	} catch {
		return ApiSerializer.error('Failed to fetch discounts');
	}
}

export async function POST(request: NextRequest) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();

		const body = await request.json();

		const validation = createDiscountSchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const data = validation.data;

		// Check for duplicate code
		const existingDiscount = await Discount.findOne({
			code: data.code,
			deletedAt: null,
		});

		if (existingDiscount) {
			return ApiSerializer.error('Discount with this code already exists', 409);
		}

		const discount = await Discount.create(data);

		return ApiSerializer.created(discount, 'Discount created successfully');
	} catch {
		return ApiSerializer.error('Failed to create discount');
	}
}
