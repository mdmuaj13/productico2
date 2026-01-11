import mongoose, { Schema } from 'mongoose';

// Product item schema with variant support
const OrderProductSchema = new Schema({
	_id: {
		type: Schema.Types.ObjectId,
		required: true,
	},
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
	// Base product price (for reference)
	basePrice: {
		type: Number,
		required: true,
	},
	// Actual price used (could be base or variant price)
	price: {
		type: Number,
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
	},
	// Variant fields
	variantName: {
		type: String,
		default: null, // e.g., "Red - Large", "500ml"
	},
	variantPrice: {
		type: Number,
		default: null, // Original variant price
	},
	variantSalePrice: {
		type: Number,
		default: null, // Variant sale price if applicable
	},
	// Warehouse for fulfillment
	warehouseId: {
		type: Schema.Types.ObjectId,
		ref: 'Warehouse',
		default: null,
	},
	// Line total for this item
	lineTotal: {
		type: Number,
		required: true, // price * quantity
	},
}, { _id: false });

const OrderSchema = new mongoose.Schema({
		// Customer Information
		customerName: {
			type: String,
			required: [true, 'customerName is required'],
		},
		customerMobile: {
			type: String,
			required: [true, 'customerMobile is required'],
		},
		customerEmail: {
			type: String,
		},
		customerAddress: {
			type: String,
			required: [true, 'customerAddress is required'],
		},
		customerDistrict: {
			type: String,
		},

		// Order Items
		products: [OrderProductSchema],

		// Order Identifiers
		code: {
			type: String,
			required: [true, 'code is required'],
			unique: true,
		},
		trackingCode: {
			type: String,
			unique: true,
			sparse: true, // Only unique if exists
		},

		// Pricing
		subTotal: {
			type: Number,
			required: [true, 'subTotal is required'],
		},
		total: {
			type: Number,
			required: [true, 'total is required'],
		},
		discount: {
			type: Number,
			default: 0,
		},
		deliveryCost: {
			type: Number,
			default: 0,
		},
		tax: {
			type: Number,
			default: 0,
		},

		// Payment Tracking
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
			// enum: [...OrderPaymentStatusEnum],
			default: 'unpaid',
		},
		paymentType: {
			type: String,
			// enum: [...OrderPaymentTypeEnum],
			default: 'cash',
		},

		// Order Status
		status: {
			type: String,
			// enum: [...OrderStatusEnum],
			default: 'pending',
		},

		// Notes & Remarks
		remark: {
			type: String,
		},

		// Flags
		eol: {
			type: Boolean,
			default: false,
		},

		// Metadata
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

// Virtual for user relationship
OrderSchema.virtual('user', {
	ref: 'User',
	localField: 'createdById',
	foreignField: '_id',
	justOne: true,
});

// Indexes for performance
OrderSchema.index({ code: 1 });
OrderSchema.index({ trackingCode: 1 });
OrderSchema.index({ customerMobile: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ deletedAt: 1 });

// Pre-save hook to calculate line totals and validate stock
OrderSchema.pre('save', async function (next) {
	if (this.isNew) {
		// Calculate line totals
		this.products.forEach((product: any) => {
			product.lineTotal = product.price * product.quantity;
		});

		// Calculate due amount
		this.due = this.total - this.paid;
	}
	next();
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);