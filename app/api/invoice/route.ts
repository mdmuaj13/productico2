import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import { createInvoiceSchema } from '@/lib/validations/invoice';

// Ensure User model is registered for populate
void User;

// GET /api/invoices - List invoices
export async function GET(request: NextRequest) {
	try {
		await dbConnect();

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const search = searchParams.get('search') || '';
		const status = searchParams.get('status') || '';
		const paymentStatus = searchParams.get('paymentStatus') || '';
		const includeDeleted = searchParams.get('includeDeleted') === 'true';

		const skip = (page - 1) * limit;

		// Build query
		const query: Record<string, unknown> = includeDeleted
			? {}
			: { isDeleted: false, deletedAt: null };

		if (search) {
			query.$or = [
				{ invoiceNo: { $regex: search, $options: 'i' } },
				{ clientName: { $regex: search, $options: 'i' } },
				{ clientMobile: { $regex: search, $options: 'i' } },
			];
		}

		if (status) {
			query.status = status;
		}

		if (paymentStatus) {
			query.paymentStatus = paymentStatus;
		}

		const [invoices, total] = await Promise.all([
			Invoice.find(query)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.populate('createdById', 'name email')
				.lean(),
			Invoice.countDocuments(query),
		]);

		return NextResponse.json({
			data: invoices,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error('Error fetching invoices:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch invoices' },
			{ status: 500 }
		);
	}
}

// POST /api/invoices - Create invoice
export async function POST(request: NextRequest) {
	try {
		await dbConnect();

		const body = await request.json();

		// Validate with Zod
		const validationResult = createInvoiceSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Validation failed',
					details: validationResult.error.issues.map((err) => ({
						field: err.path.join('.'),
						message: err.message,
					})),
				},
				{ status: 400 }
			);
		}

		const validatedData = validationResult.data;

		// Ensure invoiceNo is unique (if you generate server-side, remove this check)
		const existingInvoice = await Invoice.findOne({
			invoiceNo: validatedData.invoiceNo,
		});
		if (existingInvoice) {
			return NextResponse.json(
				{ error: 'Invoice number already exists' },
				{ status: 400 }
			);
		}

		// Calculate totals from items
		const subTotal = validatedData.items.reduce(
			(sum: number, item: { lineTotal: number }) => sum + item.lineTotal,
			0
		);

		const total = subTotal - (validatedData.discount ?? 0) + (validatedData.tax ?? 0);
		const paid = validatedData.paid ?? 0;
		const due = Math.max(total - paid, 0);

		// Derive paymentStatus if you want strict consistency
		// (optional, keep client value if you prefer)
		let paymentStatus: 'unpaid' | 'partial' | 'paid' =
			validatedData.paymentStatus ?? 'unpaid';
		if (due === 0) paymentStatus = 'paid';
		else if (paid > 0) paymentStatus = 'partial';
		else paymentStatus = 'unpaid';

		// Derive overdue status (optional)
		let status: 'draft' | 'sent' | 'paid' | 'overdue' =
			validatedData.status ?? 'draft';

		const invoiceDate = new Date(validatedData.invoiceDate);
		const dueDate = new Date(validatedData.dueDate);

		// If unpaid/partial and dueDate passed -> overdue (unless explicitly draft)
		if (status !== 'draft' && paymentStatus !== 'paid' && dueDate < new Date()) {
			status = 'overdue';
		}
		// If fully paid -> invoice status paid (optional, depends on your business rules)
		if (paymentStatus === 'paid') {
			status = 'paid';
		}

		// Create invoice
		const invoice = await Invoice.create({
			clientName: validatedData.clientName,
			clientMobile: validatedData.clientMobile,
			clientEmail: validatedData.clientEmail,
			clientAddress: validatedData.clientAddress,
			clientDistrict: validatedData.clientDistrict,

			invoiceNo: validatedData.invoiceNo,
			referenceNo: validatedData.referenceNo,

			invoiceDate,
			dueDate,

			items: validatedData.items,

			subTotal,
			discount: validatedData.discount ?? 0,
			tax: validatedData.tax ?? 0,
			total,

			paid,
			due,
			paymentStatus,
			paymentType: validatedData.paymentType,

			status,

			notes: validatedData.notes,
			terms: validatedData.terms,

			createdById: validatedData.createdById,

			// Soft delete defaults
			isDeleted: false,
			deletedAt: null,
		});

		// Populate the created invoice
		const populatedInvoice = await Invoice.findById(invoice._id)
			.populate('createdById', 'name email')
			.lean();

		return NextResponse.json(populatedInvoice, { status: 201 });
	} catch (error: unknown) {
		console.error('Error creating invoice:', error);

		if (
			error &&
			typeof error === 'object' &&
			'code' in error &&
			error.code === 11000
		) {
			return NextResponse.json(
				{ error: 'Invoice number already exists' },
				{ status: 400 }
			);
		}

		const errorMessage =
			error &&
			typeof error === 'object' &&
			'message' in error &&
			typeof error.message === 'string'
				? error.message
				: 'Unknown error';

		return NextResponse.json(
			{ error: 'Failed to create invoice', details: errorMessage },
			{ status: 500 }
		);
	}
}
