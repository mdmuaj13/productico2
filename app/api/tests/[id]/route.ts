import connectDB from '@/lib/db';
import Test from '@/models/Test';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';

// GET /api/tests/[id]
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await connectDB();

		const test = await Test.findById(id);

		if (!test) {
			return ApiSerializer.notFound('Data not found with the specific id.');
		}

		return ApiSerializer.success(test, 'Data retrieved successfully');
	} catch {
		return ApiSerializer.error('Failed to fetch data');
	}
}

// PUT /api/tests/[id]
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await connectDB();

		const body = await request.json();

		const test = await Test.findByIdAndUpdate(id, body, { new: true });

		if (!test) {
			return ApiSerializer.notFound('Data not found with the specific id.');
		}

		return ApiSerializer.success(test, 'Data updated successfully');
	} catch {
		return ApiSerializer.error('Failed to update data');
	}
}

// DELETE /api/tests/[id]
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await connectDB();

		const test = await Test.findByIdAndDelete(id);

		if (!test) {
			return ApiSerializer.notFound('Data not found with the specific id.');
		}

		return ApiSerializer.success(null, 'Data deleted successfully');
	} catch {
		return ApiSerializer.error('Failed to delete data');
	}
}
