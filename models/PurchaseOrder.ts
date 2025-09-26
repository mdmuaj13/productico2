import { Schema, model, models } from 'mongoose';

interface IPurchaseOrder {
	po_date: Date;
	vendor_id?: string;
	title: string;
	order_info?: string;
	price: number;
	status: 'pending' | 'approved' | 'received' | 'cancelled';
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
}

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
	{
		po_date: {
			type: Date,
			required: [true, 'Purchase order date is required'],
		},
		vendor_id: {
			type: Schema.Types.ObjectId,
			ref: 'Vendor',
		},
		title: {
			type: String,
			required: [true, 'Title is required'],
			trim: true,
		},
		order_info: {
			type: String,
			trim: true,
		},
		price: {
			type: Number,
			required: [true, 'Price is required'],
			min: [0, 'Price must be positive'],
		},
		status: {
			type: String,
			enum: ['pending', 'approved', 'received', 'cancelled'],
			default: 'pending',
		},
		deletedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

purchaseOrderSchema.index({ po_date: -1 });
purchaseOrderSchema.index({ vendor_id: 1 });
purchaseOrderSchema.index({ status: 1 });

const PurchaseOrder =
	models.PurchaseOrder ||
	model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);

export default PurchaseOrder;
