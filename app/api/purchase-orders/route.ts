import connectDB from '@/lib/db';
import PurchaseOrder from '@/models/PurchaseOrder';
import Vendor from '@/models/Vendor';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { createPurchaseOrderSchema } from '@/lib/validations/purchaseOrder';

export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const searchParams = request.nextUrl.searchParams;
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const search = searchParams.get('search') || '';
		const status = searchParams.get('status');

		const skip = (page - 1) * limit;

		const query: Record<string, unknown> = { deletedAt: null };

		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: 'i' } },
				{ order_info: { $regex: search, $options: 'i' } },
			];
		}

		if (status) {
			query.status = status;
		}

		const purchaseOrders = await PurchaseOrder.find(query)
			.populate({
				path: 'vendor_id',
				select: 'name contact_number email address',
				match: { deletedAt: null },
			})
			.sort({ po_date: -1, createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const total = await PurchaseOrder.countDocuments(query);

		const meta = {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};

		return ApiSerializer.success(
			purchaseOrders,
			'Purchase orders retrieved successfully',
			meta
		);
	} catch {
		return ApiSerializer.error('Failed to retrieve purchase orders');
	}
}

export async function POST(request: NextRequest) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		await connectDB();

		const body = await request.json();

		const validation = createPurchaseOrderSchema.safeParse(body);
		console.log(validation);
		if (!validation.success) {
			return ApiSerializer.error(validation.error.issues[0].message, 400);
		}

		const {
			po_date,
			vendor_id,
			title,
			order_info,
			price,
			status,
			vendor_name,
			vendor_contact_number,
			vendor_email,
			vendor_address,
			vendor_remarks,
		} = validation.data;

		let finalVendorId = vendor_id;

		// If no vendor_id provided but vendor details are provided, create a new vendor
		if (!vendor_id && vendor_name && vendor_contact_number) {
			// Check if vendor with same contact number already exists
			const existingVendor = await Vendor.findOne({
				contact_number: vendor_contact_number,
				deletedAt: null,
			});

			if (existingVendor) {
				finalVendorId = existingVendor._id.toString();
			} else {
				// Create new vendor
				const newVendor = await Vendor.create({
					name: vendor_name,
					contact_number: vendor_contact_number,
					email: vendor_email || undefined,
					address: vendor_address || undefined,
					remarks: vendor_remarks || undefined,
				});

				finalVendorId = newVendor._id.toString();
			}
		}

		const purchaseOrder = await PurchaseOrder.create({
			po_date,
			vendor_id: finalVendorId,
			title,
			order_info,
			price,
			status,
		});

		// Populate vendor details for response if vendor_id exists
		const populatedPurchaseOrder = await PurchaseOrder.findById(
			purchaseOrder._id
		).populate('vendor_id', 'name contact_number email address');

		return ApiSerializer.created(
			populatedPurchaseOrder,
			'Purchase order created successfully'
		);
	} catch {
		return ApiSerializer.error('Failed to create purchase order');
	}
}
