import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { updateProductSchema } from '@/lib/validations/product';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await connectDB();
		const { id } = await params;

		const product = await Product.findOne({
			_id: id,
			deletedAt: null,
		}).populate('categoryId', 'name slug');

		if (!product) {
			return ApiSerializer.notFound('Product not found');
		}

		return ApiSerializer.success(product, 'Product retrieved successfully');
	} catch {
		return ApiSerializer.error('Failed to retrieve product');
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();
		const { id } = await params;

		const body = await request.json();

		const validation = updateProductSchema.safeParse(body);
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

		const product = await Product.findOne({ _id: id, deletedAt: null });

		if (!product) {
			return ApiSerializer.notFound('Product not found');
		}

		const existingProduct = await Product.findOne({
			slug,
			_id: { $ne: id },
			deletedAt: null,
		});

		if (existingProduct) {
			return ApiSerializer.error('Product with this title already exists', 409);
		}

		const updatedProduct = await Product.findByIdAndUpdate(
			id,
			{
				...(title !== undefined && { title }),
				...(slug !== undefined && { slug }),
				...(thumbnail !== undefined && { thumbnail }),
				...(images !== undefined && { images }),
				...(description !== undefined && { description }),
				...(shortDetail !== undefined && { shortDetail }),
				...(price !== undefined && { price }),
				...(salePrice !== undefined && { salePrice }),
				...(unit !== undefined && { unit }),
				...(tags !== undefined && { tags }),
				...(categoryId !== undefined && { categoryId }),
				...(variants !== undefined && { variants }),
			},
			{ new: true }
		).populate('categoryId', 'name slug');

		return ApiSerializer.success(
			updatedProduct,
			'Product updated successfully'
		);
	} catch {
		return ApiSerializer.error('Failed to update product');
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();
		const { id } = await params;

		const product = await Product.findOne({ _id: id, deletedAt: null });

		if (!product) {
			return ApiSerializer.notFound('Product not found');
		}

		await Product.findByIdAndUpdate(id, { deletedAt: new Date() });

		return ApiSerializer.success(null, 'Product deleted successfully');
	} catch {
		return ApiSerializer.error('Failed to delete product');
	}
}
