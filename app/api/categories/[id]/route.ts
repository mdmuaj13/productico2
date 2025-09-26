import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { updateCategorySchema } from '@/lib/validations/category';
import slugify from 'slugify';

// GET /api/categories/[id]
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await connectDB();
		const { id } = await params;

		const category = await Category.findOne({
			_id: id,
			deletedAt: null,
		});

		if (!category) {
			return ApiSerializer.notFound('Category not found');
		}

		return ApiSerializer.success(category, 'Category retrieved successfully');
	} catch (error) {
		console.error('Error fetching category:', error);
		return ApiSerializer.error('Failed to fetch category');
	}
}

// PUT /api/categories/[id]
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

		const validation = updateCategorySchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const updateData = validation.data;

		// Generate slug if title is being updated
		if (updateData.title && !updateData.slug) {
			updateData.slug = slugify(updateData.title, { lower: true, strict: true });
		}

		// Check for duplicates
		if (updateData.title || updateData.slug) {
			const existingCategory = await Category.findOne({
				_id: { $ne: id },
				$or: [
					...(updateData.title ? [{ title: updateData.title }] : []),
					...(updateData.slug ? [{ slug: updateData.slug }] : []),
				],
				deletedAt: null,
			});

			if (existingCategory) {
				return ApiSerializer.error('Another category with this title or slug already exists', 409);
			}
		}

		const category = await Category.findOneAndUpdate(
			{ _id: id, deletedAt: null },
			{ $set: updateData },
			{ new: true, runValidators: true }
		);

		if (!category) {
			return ApiSerializer.notFound('Category not found');
		}

		return ApiSerializer.success(category, 'Category updated successfully');
	} catch {
		return ApiSerializer.error('Failed to update category');
	}
}

// DELETE /api/categories/[id]
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();
		const { id } = await params;

		const category = await Category.findOneAndUpdate(
			{ _id: id, deletedAt: null },
			{ $set: { deletedAt: new Date() } },
			{ new: true }
		);

		if (!category) {
			return ApiSerializer.notFound('Category not found');
		}

		return ApiSerializer.success(null, 'Category deleted successfully');
	} catch {
		return ApiSerializer.error('Failed to delete category');
	}
}
