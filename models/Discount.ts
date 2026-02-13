import { Schema, model, models } from 'mongoose';

interface IDiscount {
	code: string;
	type: 'percentage' | 'fixed';
	value: number;
	minOrderAmount?: number;
	maxUses?: number;
	usedCount: number;
	startDate?: Date;
	endDate?: Date;
	isActive: boolean;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const discountSchema = new Schema<IDiscount>(
	{
		code: {
			type: String,
			required: [true, 'Discount code is required'],
			trim: true,
			unique: true,
			uppercase: true,
		},
		type: {
			type: String,
			required: [true, 'Discount type is required'],
			enum: ['percentage', 'fixed'],
		},
		value: {
			type: Number,
			required: [true, 'Discount value is required'],
			min: [0, 'Value must be positive'],
		},
		minOrderAmount: {
			type: Number,
			default: 0,
			min: [0, 'Minimum order amount must be positive'],
		},
		maxUses: {
			type: Number,
			default: null,
		},
		usedCount: {
			type: Number,
			default: 0,
		},
		startDate: {
			type: Date,
			default: null,
		},
		endDate: {
			type: Date,
			default: null,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		deletedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	},
);

discountSchema.index({ code: 1 }, { unique: true });
discountSchema.index({ deletedAt: 1 });
discountSchema.index({ isActive: 1 });

const Discount =
	models.Discount || model<IDiscount>('Discount', discountSchema);

export default Discount;
