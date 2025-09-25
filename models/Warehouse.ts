import { Schema, model, models } from 'mongoose';
import slugify from 'slugify';

interface IWarehouse {
	title: string;
	slug: string;
	description?: string;
	address?: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
}

const warehouseSchema = new Schema<IWarehouse>(
	{
		title: { type: String, required: true },
		slug: { type: String, unique: true },
		description: { type: String },
		address: { type: String },
		deletedAt: { type: Date, default: null },
	},
	{
		timestamps: true,
	}
);

warehouseSchema.pre('save', function (next) {
	if (this.isModified('title') && !this.slug) {
		this.slug = slugify(this.title, { lower: true, strict: true });
	}
	next();
});

warehouseSchema.index({ slug: 1 });
warehouseSchema.index({ title: 1 });
warehouseSchema.index({ deletedAt: 1 });

const Warehouse = models.Warehouse || model<IWarehouse>('Warehouse', warehouseSchema);

export default Warehouse;