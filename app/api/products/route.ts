import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { createProductSchema } from '@/lib/validations/product';

export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const search = searchParams.get('search') || '';
		const categoryId = searchParams.get('categoryId');

		const skip = (page - 1) * limit;

		const query: Record<string, unknown> = { deletedAt: null };

		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
				{ tags: { $in: [new RegExp(search, 'i')] } },
			];
		}

		if (categoryId) {
			query.categoryId = categoryId;
		}

		const products = await Product.find(query)
			.populate('categoryId', 'title slug description image')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const total = await Product.countDocuments(query);

		const meta = {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};

		return ApiSerializer.success(products, 'Products retrieved successfully', meta);
	} catch {
		return ApiSerializer.error('Failed to retrieve products');
	}
}

export async function POST(request: NextRequest) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();

		const body = await request.json();

		const validation = createProductSchema.safeParse(body);
		console.log(validation);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const {
			title,
			slug,
			thumbnail,
			images,
			description,
			shortDetail,
			price,
			salePrice,
			unit,
			tags,
			categoryId,
			variants,
		} = validation.data;

		// const slug = slugify(title, { lower: true, strict: true });

		const existingProduct = await Product.findOne({ slug });
		if (existingProduct) {
			return ApiSerializer.error('Product with this slug already exists', 409);
		}

		const product = await Product.create({
			title,
			slug,
			thumbnail,
			images,
			description,
			shortDetail,
			price,
			salePrice,
			unit,
			tags,
			categoryId,
			variants,
		});

		const populatedProduct = await Product.findById(product._id).populate('categoryId', 'name slug');

		return ApiSerializer.created(populatedProduct, 'Product created successfully');
	} catch {
		return ApiSerializer.error('Failed to create product');
	}
}