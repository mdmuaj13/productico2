import { Schema, model, models } from 'mongoose';

interface IVendor {
	name: string;
	contact_number: string;
	email?: string;
	address?: string;
	remarks?: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
}

const vendorSchema = new Schema<IVendor>(
	{
		name: { type: String, required: true },
		contact_number: { type: String, required: true },
		email: { type: String },
		address: { type: String },
		remarks: { type: String },
		deletedAt: { type: Date, default: null },
	},
	{
		timestamps: true,
	}
);

vendorSchema.index({ name: 1 });
vendorSchema.index({ contact_number: 1 });
vendorSchema.index({ email: 1 });
vendorSchema.index({ deletedAt: 1 });

const Vendor = models.Vendor || model<IVendor>('Vendor', vendorSchema);

export default Vendor;