import connectDB from '@/lib/db';
import Warehouse from '@/models/Warehouse';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { updateWarehouseSchema } from '@/lib/validations/warehouse';
import slugify from 'slugify';

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		await connectDB();

		const warehouse = await Warehouse.findOne({
			_id: params.id,
			deletedAt: null,
		});

		if (!warehouse) {
			return ApiSerializer.notFound('Warehouse not found');
		}

		return ApiSerializer.success(warehouse, 'Warehouse retrieved successfully');
	} catch {
		return ApiSerializer.error('Failed to retrieve warehouse');
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();

		const body = await request.json();

		const validation = updateWarehouseSchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const { title, slug, description, address } = validation.data;

		const warehouse = await Warehouse.findOne({ _id: params.id, deletedAt: null });

		if (!warehouse) {
			return ApiSerializer.notFound('Warehouse not found');
		}

		if (slug) {
			const existingWarehouse = await Warehouse.findOne({
				slug,
				_id: { $ne: params.id },
				deletedAt: null,
			});

			if (existingWarehouse) {
				return ApiSerializer.error('Warehouse with this slug already exists', 409);
			}
		}

		const updatedWarehouse = await Warehouse.findByIdAndUpdate(
			params.id,
			{
				...(title !== undefined && { title }),
				...(slug !== undefined && { slug }),
				...(description !== undefined && { description }),
				...(address !== undefined && { address }),
			},
			{ new: true }
		);

		return ApiSerializer.success(
			updatedWarehouse,
			'Warehouse updated successfully'
		);
	} catch {
		return ApiSerializer.error('Failed to update warehouse');
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();

		const warehouse = await Warehouse.findOne({ _id: params.id, deletedAt: null });

		if (!warehouse) {
			return ApiSerializer.notFound('Warehouse not found');
		}

		await Warehouse.findByIdAndUpdate(params.id, { deletedAt: new Date() });

		return ApiSerializer.success(null, 'Warehouse deleted successfully');
	} catch {
		return ApiSerializer.error('Failed to delete warehouse');
	}
}