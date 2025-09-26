import connectDB from '@/lib/db';
import Warehouse from '@/models/Warehouse';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { createWarehouseSchema } from '@/lib/validations/warehouse';
import slugify from 'slugify';

export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const search = searchParams.get('search') || '';

		const skip = (page - 1) * limit;

		const query: Record<string, unknown> = { deletedAt: null };

		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
				{ address: { $regex: search, $options: 'i' } },
			];
		}

		const warehouses = await Warehouse.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const total = await Warehouse.countDocuments(query);

		const meta = {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};

		return ApiSerializer.success(warehouses, 'Warehouses retrieved successfully', meta);
	} catch {
		return ApiSerializer.error('Failed to retrieve warehouses');
	}
}

export async function POST(request: NextRequest) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();

		const body = await request.json();

		const validation = createWarehouseSchema.safeParse(body);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const { title, description, address } = validation.data;
		const slug = slugify(title, { lower: true });

		const existingWarehouse = await Warehouse.findOne({ slug });
		if (existingWarehouse) {
			return ApiSerializer.error('Warehouse with this slug already exists', 409);
		}

		const warehouse = await Warehouse.create({
			title,
			slug,
			description,
			address,
		});

		return ApiSerializer.created(warehouse, 'Warehouse created successfully');
	} catch {
		return ApiSerializer.error('Failed to create warehouse');
	}
}