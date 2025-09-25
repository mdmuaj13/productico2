import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { createCategorySchema } from '@/lib/validations/category';
import slugify from 'slugify';

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
			query.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
			];
		}

		if (isActive !== null) {
			query.isActive = isActive === 'true';
		}

		const categories = await Category.find(query)
			.sort({ serialNo: 1, createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const total = await Category.countDocuments(query);

		const meta = {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};

		return ApiSerializer.success(categories, 'Categories retrieved successfully', meta);
	} catch {
		return ApiSerializer.error('Failed to fetch categories');
	}
}

export async function POST(request: NextRequest) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();

		const body = await request.json();

		const validation = createCategorySchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const { title, slug, description, image, serialNo, isActive } = validation.data;

		const generatedSlug = slug || slugify(title, { lower: true, strict: true });

		const existingCategory = await Category.findOne({
			$or: [{ slug: generatedSlug }, { title }],
			deletedAt: null,
		});

		if (existingCategory) {
			return ApiSerializer.error('Category with this title or slug already exists', 409);
		}

		const category = await Category.create({
			title,
			slug: generatedSlug,
			description,
			image,
			serialNo,
			isActive,
		});

		return ApiSerializer.created(category, 'Category created successfully');
	} catch {
		return ApiSerializer.error('Failed to create category');
	}
}
