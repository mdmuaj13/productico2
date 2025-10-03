import mongoose, { Schema, model, models } from 'mongoose';

interface IStock {
	productId: mongoose.Types.ObjectId;
	variantId: mongoose.Types.ObjectId | null;
	variantName: string | null; // null = base product, otherwise variant name
	warehouseId: mongoose.Types.ObjectId;
	quantity: number;
	reorderPoint?: number;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
}

const stockSchema = new Schema<IStock>(
	{
		productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
		variantId: { type: Schema.Types.ObjectId, default: null },
		variantName: { type: String, default: null }, // Matches variant.name from Product
		warehouseId: {
			type: Schema.Types.ObjectId,
			ref: 'Warehouse',
			required: true,
		},
		quantity: { type: Number, required: true, default: 0 },
		reorderPoint: { type: Number, default: 10 },
    deletedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

// One stock entry per product-variant-warehouse
stockSchema.index(
	{ productId: 1, variantId: 1, warehouseId: 1 },
	{ unique: true }
);
stockSchema.index({ productId: 1 }); // For product list aggregation
stockSchema.index({ warehouseId: 1 });

const Stock = models.Stock || model<IStock>('Stock', stockSchema);

export default Stock;
