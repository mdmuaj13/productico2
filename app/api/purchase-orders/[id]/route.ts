import connectDB from '@/lib/db';
import PurchaseOrder from '@/models/PurchaseOrder';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { updatePurchaseOrderSchema } from '@/lib/validations/purchaseOrder';

// GET /api/purchase-orders/[id]
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await connectDB();

		const purchaseOrder = await PurchaseOrder.findOne({
			_id: id,
			deletedAt: null,
		}).populate({
			path: 'vendor_id',
			select: 'name contact_number email address',
			match: { deletedAt: null }
		});

		if (!purchaseOrder) {
			return ApiSerializer.notFound('Purchase order not found');
		}

		return ApiSerializer.success(purchaseOrder, 'Purchase order retrieved successfully');
	} catch (error) {
		console.error('Error fetching purchase order:', error);
		return ApiSerializer.error('Failed to fetch purchase order');
	}
}

// PUT /api/purchase-orders/[id]
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();

		const body = await request.json();

		const validation = updatePurchaseOrderSchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const updateData = validation.data;

		const purchaseOrder = await PurchaseOrder.findOneAndUpdate(
			{ _id: id, deletedAt: null },
			{ $set: updateData },
			{ new: true, runValidators: true }
		).populate({
			path: 'vendor_id',
			select: 'name contact_number email address',
			match: { deletedAt: null }
		});

		if (!purchaseOrder) {
			return ApiSerializer.notFound('Purchase order not found');
		}

		return ApiSerializer.success(purchaseOrder, 'Purchase order updated successfully');
	} catch {
		return ApiSerializer.error('Failed to update purchase order');
	}
}

// DELETE /api/purchase-orders/[id]
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();

		const purchaseOrder = await PurchaseOrder.findOneAndUpdate(
			{ _id: id, deletedAt: null },
			{ $set: { deletedAt: new Date() } },
			{ new: true }
		);

		if (!purchaseOrder) {
			return ApiSerializer.notFound('Purchase order not found');
		}

		return ApiSerializer.success(null, 'Purchase order deleted successfully');
	} catch {
		return ApiSerializer.error('Failed to delete purchase order');
	}
}