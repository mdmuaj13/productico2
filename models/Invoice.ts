import mongoose, { Schema } from 'mongoose';

/**
 * Invoice Line Item Schema
 * (similar to OrderProductSchema but semantically invoice-based)
 */
const InvoiceItemSchema = new Schema(
	{
		_id: {
			type: Schema.Types.ObjectId,
			required: true,
		},

		// Product reference info (optional but useful)
		slug: {
			type: String,
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		shortDetail: {
			type: String,
		},
		thumbnail: {
			type: String,
		},

		// Pricing
		basePrice: {
			type: Number,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		quantity: {
			type: Number,
			required: true,
			min: 1,
		},

		// Variant support
		variantName: {
			type: String,
			default: null,
		},
		variantPrice: {
			type: Number,
			default: null,
		},
		variantSalePrice: {
			type: Number,
			default: null,
		},

		// Optional fulfillment reference
		warehouseId: {
			type: Schema.Types.ObjectId,
			ref: 'Warehouse',
			default: null,
		},

		// Computed
		lineTotal: {
			type: Number,
			required: true,
		},
	},
	{ _id: false }
);

/**
 * Invoice Schema
 */
const InvoiceSchema = new mongoose.Schema(
	{
		/* ============================
		   Client Information
		============================ */
		clientName: {
			type: String,
			required: [true, 'clientName is required'],
		},
		clientMobile: {
			type: String,
			required: [true, 'clientMobile is required'],
		},
		clientEmail: {
			type: String,
		},
		clientAddress: {
			type: String,
			required: [true, 'clientAddress is required'],
		},
		clientDistrict: {
			type: String,
		},

		/* ============================
		   Invoice Identifiers
		============================ */
		invoiceNo: {
			type: String,
			required: [true, 'invoiceNo is required'],
			unique: true,
		},
		referenceNo: {
			type: String,
			unique: true,
			sparse: true,
		},

		/* ============================
		   Dates
		============================ */
		invoiceDate: {
			type: Date,
			required: true,
		},
		dueDate: {
			type: Date,
			required: true,
		},

		/* ============================
		   Line Items
		============================ */
		items: {
			type: [InvoiceItemSchema],
			required: true,
			validate: {
				validator: (v: any[]) => v.length > 0,
				message: 'At least one invoice item is required',
			},
		},

		/* ============================
		   Pricing
		============================ */
		subTotal: {
			type: Number,
			required: [true, 'subTotal is required'],
		},
		discount: {
			type: Number,
			default: 0,
		},
		tax: {
			type: Number,
			default: 0,
		},
		total: {
			type: Number,
			required: [true, 'total is required'],
		},

		/* ============================
		   Payment Tracking
		============================ */
		paid: {
			type: Number,
			default: 0,
		},
		due: {
			type: Number,
			default: 0,
		},
		paymentStatus: {
			type: String,
			enum: ['unpaid', 'partial', 'paid'],
			default: 'unpaid',
		},
		paymentType: {
			type: String,
			enum: ['cash', 'bank', 'bkash', 'nagad', 'card'],
			default: 'cash',
		},

		/* ============================
		   Invoice Status
		============================ */
		status: {
			type: String,
			enum: ['draft', 'sent', 'paid', 'overdue'],
			default: 'draft',
		},

		/* ============================
		   Notes & Terms
		============================ */
		notes: {
			type: String,
		},
		terms: {
			type: String,
		},

		/* ============================
		   Flags
		============================ */
		isDeleted: {
			type: Boolean,
			default: false,
		},

		/* ============================
		   Metadata
		============================ */
		createdById: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			default: null,
		},
		deletedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

/* ============================
   Virtuals
============================ */
InvoiceSchema.virtual('user', {
	ref: 'User',
	localField: 'createdById',
	foreignField: '_id',
	justOne: true,
});

/* ============================
   Indexes
============================ */
InvoiceSchema.index({ invoiceNo: 1 });
InvoiceSchema.index({ referenceNo: 1 });
InvoiceSchema.index({ clientMobile: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ paymentStatus: 1 });
InvoiceSchema.index({ invoiceDate: -1 });
InvoiceSchema.index({ dueDate: 1 });
InvoiceSchema.index({ deletedAt: 1 });

/* ============================
   Pre-save Hook
============================ */
InvoiceSchema.pre('save', function (next) {
	// Calculate line totals
	this.items.forEach((item: any) => {
		item.lineTotal = item.price * item.quantity;
	});

	// Calculate due
	this.due = Math.max(this.total - this.paid, 0);

	// Auto mark overdue
	if (
		this.status !== 'paid' &&
		this.due > 0 &&
		this.dueDate &&
		new Date(this.dueDate) < new Date()
	) {
		this.status = 'overdue';
	}

	next();
});

export default mongoose.models.Invoice ||
	mongoose.model('Invoice', InvoiceSchema);
