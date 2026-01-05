import { z } from 'zod';

// Reuse the same "productSchema" style, but name it invoiceItemSchema if you prefer.
// This matches your InvoiceItemSchema fields.
export const invoiceItemSchema = z.object({
	_id: z.string().min(1, 'Item ID is required'),
	slug: z.string().optional(),
	title: z.string().min(1, 'Item title is required'),
	description: z.string().optional(),
	shortDetail: z.string().optional(),
	thumbnail: z.string().optional(),

	basePrice: z.number().nonnegative('Base price must be non-negative'),
	price: z.number().nonnegative('Price must be non-negative'),
	quantity: z.number().positive('Quantity must be positive'),

	variantName: z.string().nullable().optional(),
	variantPrice: z.number().nullable().optional(),
	variantSalePrice: z.number().nullable().optional(),

	warehouseId: z.string().nullable().optional(),

	lineTotal: z.number().nonnegative('Line total must be non-negative'),
});

export const createInvoiceSchema = z
	.object({
		// Client info
		clientName: z.string().min(1, 'Client name is required'),
		clientMobile: z.string().min(1, 'Client mobile is required'),
		clientEmail: z.string().email().optional().or(z.literal('')),
		clientAddress: z.string().min(1, 'Client address is required'),
		clientDistrict: z.string().optional(),

		// Identifiers
		invoiceNo: z.string().min(1, 'Invoice number is required'),
		referenceNo: z.string().optional(),

		// Dates
		// Accept ISO string from client, validate it parses to a real date.
		invoiceDate: z
			.string()
			.min(1, 'Invoice date is required')
			.refine((v) => !Number.isNaN(Date.parse(v)), 'Invoice date must be a valid date'),
		dueDate: z
			.string()
			.min(1, 'Due date is required')
			.refine((v) => !Number.isNaN(Date.parse(v)), 'Due date must be a valid date'),

		// Items
		items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),

		// Pricing
		subTotal: z.number().nonnegative('Sub total must be non-negative'),
		discount: z.number().nonnegative('Discount must be non-negative').optional().default(0),
		tax: z.number().nonnegative('Tax must be non-negative').optional().default(0),
		total: z.number().nonnegative('Total must be non-negative'),

		// Payment tracking
		paid: z.number().nonnegative('Paid amount must be non-negative').optional().default(0),
		due: z.number().nonnegative('Due amount must be non-negative').optional().default(0),
		paymentStatus: z.enum(['paid', 'unpaid', 'partial']).optional().default('unpaid'),
		paymentType: z
			.enum(['cash', 'card', 'bkash', 'nagad', 'rocket', 'bank'])
			.optional()
			.default('cash'),

		// Invoice status
		status: z.enum(['draft', 'sent', 'paid', 'overdue']).optional().default('draft'),

		// Notes/Terms
		notes: z.string().optional(),
		terms: z.string().optional(),

		// Metadata / soft delete fields (usually set server-side)
		createdById: z.string().optional(),
		isDeleted: z.boolean().optional(),
		deletedAt: z.string().nullable().optional(),
	})
	.superRefine((data, ctx) => {
		// Validate date ordering
		const invoiceDate = new Date(data.invoiceDate);
		const dueDate = new Date(data.dueDate);
		if (dueDate < invoiceDate) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['dueDate'],
				message: 'Due date cannot be earlier than invoice date',
			});
		}

		// Validate line totals match price * quantity (tolerant for floating point)
		const EPS = 0.01;
		data.items.forEach((item, idx) => {
			const expected = item.price * item.quantity;
			if (Math.abs(item.lineTotal - expected) > EPS) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['items', idx, 'lineTotal'],
					message: `Line total should be price × quantity (${expected.toFixed(2)})`,
				});
			}
		});

		// Validate subtotal equals sum(lineTotal)
		const itemsSum = data.items.reduce((sum, i) => sum + i.lineTotal, 0);
		if (Math.abs(data.subTotal - itemsSum) > EPS) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['subTotal'],
				message: `Sub total should equal sum of line totals (${itemsSum.toFixed(2)})`,
			});
		}

		// Validate total equals subTotal - discount + tax (basic model you used)
		const expectedTotal = data.subTotal - (data.discount ?? 0) + (data.tax ?? 0);
		if (Math.abs(data.total - expectedTotal) > EPS) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['total'],
				message: `Total should be subTotal - discount + tax (${expectedTotal.toFixed(2)})`,
			});
		}

		// Payment consistency
		const paid = data.paid ?? 0;
		if (paid > data.total + EPS) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['paid'],
				message: 'Paid amount cannot exceed total',
			});
		}

		// If due is provided, ensure it matches total - paid
		if (typeof data.due === 'number') {
			const expectedDue = Math.max(data.total - paid, 0);
			if (Math.abs(data.due - expectedDue) > EPS) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['due'],
					message: `Due should be total - paid (${expectedDue.toFixed(2)})`,
				});
			}
		}

		// paymentStatus consistency
		const dueComputed = Math.max(data.total - paid, 0);
		if (dueComputed <= EPS && data.paymentStatus !== 'paid') {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['paymentStatus'],
				message: 'Payment status should be "paid" when due is 0',
			});
		}
		if (paid > EPS && dueComputed > EPS && data.paymentStatus === 'unpaid') {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['paymentStatus'],
				message: 'Payment status should be "partial" when some amount is paid',
			});
		}
	});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
