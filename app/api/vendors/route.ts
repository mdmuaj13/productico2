import connectDB from '@/lib/db';
import Vendor from '@/models/Vendor';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { createVendorSchema } from '@/lib/validations/vendor';

export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const search = searchParams.get('search') || '';

		const skip = (page - 1) * limit;

		const query: any = { deletedAt: null };

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
				{ contact_number: { $regex: search, $options: 'i' } },
				{ address: { $regex: search, $options: 'i' } },
				{ remarks: { $regex: search, $options: 'i' } },
			];
		}

		const vendors = await Vendor.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const total = await Vendor.countDocuments(query);

		const meta = {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};

		return ApiSerializer.success(
			vendors,
			'Vendors retrieved successfully',
			meta
		);
	} catch {
		return ApiSerializer.error('Failed to retrieve vendors');
	}
}

export async function POST(request: NextRequest) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();

		const body = await request.json();

		const validation = createVendorSchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const { name, contact_number, email, address, remarks } = validation.data;

		const vendor = await Vendor.create({
			name,
			contact_number,
			email: email || undefined,
			address,
			remarks,
		});

		return ApiSerializer.created(vendor, 'Vendor created successfully');
	} catch {
		return ApiSerializer.error('Failed to create vendor');
	}
}
