import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import { createInvoiceSchema } from '@/lib/validations/invoice';

// Ensure User model is registered for populate
void User;

// GET /api/invoices/[id] - Get single invoice
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await dbConnect();

		const invoice = await Invoice.findOne({
			_id: id,
			isDeleted: false,
			deletedAt: null,
		})
			.populate('createdById', 'name email')
			.lean();

		if (!invoice) {
			return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
		}

		return NextResponse.json(invoice);
	} catch (error) {
		console.error('Error fetching invoice:', error);
		return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
	}
}


// PUT /api/invoices/[id] - Update invoice
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await dbConnect();

		const body = await request.json();

		// Validate with Zod (partial validation for updates)
		const validationResult = createInvoiceSchema.partial().safeParse(body);

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

		// Never allow client to directly set deletion fields via update
		// (protect audit trail)
		delete (validatedData as any).isDeleted;
		delete (validatedData as any).deletedAt;

		// Calculate totals if items are provided
		let updateData: Record<string, unknown> = { ...validatedData };

		if (validatedData.items && validatedData.items.length > 0) {
			const subTotal = validatedData.items.reduce(
				(sum: number, item: { lineTotal: number }) => sum + item.lineTotal,
				0
			);

			const discount = (validatedData.discount ?? 0) as number;
			const tax = (validatedData.tax ?? 0) as number;
			const total = subTotal - discount + tax;

			const paid = (validatedData.paid ?? 0) as number;
			const due = Math.max(total - paid, 0);

			// Derive paymentStatus if not provided (optional but helps consistency)
			let paymentStatus =
				(validatedData.paymentStatus as 'unpaid' | 'partial' | 'paid' | undefined) ??
				undefined;

			if (!paymentStatus) {
				if (due === 0) paymentStatus = 'paid';
				else if (paid > 0) paymentStatus = 'partial';
				else paymentStatus = 'unpaid';
			}

			// Derive overdue status if dueDate provided or invoice already has dueDate
			let status =
				(validatedData.status as 'draft' | 'sent' | 'paid' | 'overdue' | undefined) ??
				undefined;

			// If fully paid, force invoice status to paid (optional)
			if (paymentStatus === 'paid') status = 'paid';

			updateData = {
				...updateData,
				subTotal,
				total,
				due,
				paymentStatus,
				...(status ? { status } : {}),
			};
		}

		const invoice = await Invoice.findOneAndUpdate(
			{ _id: id, isDeleted: false, deletedAt: null },
			updateData,
			{ new: true, runValidators: true }
		).populate('createdById', 'name email');

		if (!invoice) {
			return NextResponse.json(
				{ error: 'Invoice not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json(invoice);
	} catch (error: unknown) {
		console.error('Error updating invoice:', error);

		const errorMessage =
			error &&
			typeof error === 'object' &&
			'message' in error &&
			typeof error.message === 'string'
				? error.message
				: 'Unknown error';

		return NextResponse.json(
			{ error: 'Failed to update invoice', details: errorMessage },
			{ status: 500 }
		);
	}
}

// DELETE /api/invoices/[id] - Delete invoice (soft delete)
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await dbConnect();

		const invoice = await Invoice.findOneAndUpdate(
			{ _id: id, isDeleted: false, deletedAt: null },
			{
				isDeleted: true,
				deletedAt: new Date(),
			},
			{ new: true }
		);

		if (!invoice) {
			return NextResponse.json(
				{ error: 'Invoice not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({ message: 'Invoice deleted successfully' });
	} catch (error) {
		console.error('Error deleting invoice:', error);
		return NextResponse.json(
			{ error: 'Failed to delete invoice' },
			{ status: 500 }
		);
	}
}
