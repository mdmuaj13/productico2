import mongoose, { Schema, model, models } from 'mongoose';

interface IStorefront {
	_id: mongoose.Types.ObjectId;
	type: string;
	value: Record<string, unknown>;
	createdAt: Date;
	updatedAt: Date;
}

// value = info / assets / social / contact / privacy / terms / refund
const storefrontSchema = new Schema<IStorefront>(
	{
		type: {
			type: String,
			required: true,
			unique: true,
			default: 'info',
		},
		value: {
			type: Schema.Types.Mixed,
			required: true,
			default: {},
		},
	},
	{
		timestamps: true,
	},
);

// Note: 'type' already has an index from 'unique: true'

const Storefront =
	models.Storefront || model<IStorefront>('Storefront', storefrontSchema);

export default Storefront;
