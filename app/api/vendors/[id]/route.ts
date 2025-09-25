import connectDB from '@/lib/db';
import Vendor from '@/models/Vendor';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { updateVendorSchema } from '@/lib/validations/vendor';

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		await connectDB();

		const vendor = await Vendor.findOne({
			_id: params.id,
			deletedAt: null,
		});

		if (!vendor) {
			return ApiSerializer.notFound('Vendor not found');
		}

		return ApiSerializer.success(vendor, 'Vendor retrieved successfully');
	} catch {
		return ApiSerializer.error('Failed to retrieve vendor');
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

		const validation = updateVendorSchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const { name, contact_number, email, address, remarks } = validation.data;

		const vendor = await Vendor.findOne({ _id: params.id, deletedAt: null });

		if (!vendor) {
			return ApiSerializer.notFound('Vendor not found');
		}

		const updatedVendor = await Vendor.findByIdAndUpdate(
			params.id,
			{
				...(name !== undefined && { name }),
				...(contact_number !== undefined && { contact_number }),
				...(email !== undefined && { email: email || undefined }),
				...(address !== undefined && { address }),
				...(remarks !== undefined && { remarks }),
			},
			{ new: true }
		);

		return ApiSerializer.success(updatedVendor, 'Vendor updated successfully');
	} catch {
		return ApiSerializer.error('Failed to update vendor');
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

		const vendor = await Vendor.findOne({ _id: params.id, deletedAt: null });

		if (!vendor) {
			return ApiSerializer.notFound('Vendor not found');
		}

		await Vendor.findByIdAndUpdate(params.id, { deletedAt: new Date() });

		return ApiSerializer.success(null, 'Vendor deleted successfully');
	} catch {
		return ApiSerializer.error('Failed to delete vendor');
	}
}
