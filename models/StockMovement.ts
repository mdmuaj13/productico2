import mongoose, { Schema, model, models } from 'mongoose';

type MovementType =
	| 'purchase' // From purchase orders
	| 'sale' // From customer orders
	| 'adjustment' // Manual correction
	| 'transfer' // Between warehouses
	| 'return' // Customer returns
	| 'damage'; // Damaged/lost stock

interface IStockMovement {
	productId: mongoose.Types.ObjectId;
	variantName: string | null;
	warehouseId: mongoose.Types.ObjectId;
	type: MovementType;
	quantity: number; // Positive for incoming, negative for outgoing
	referenceId?: mongoose.Types.ObjectId;
	referenceType?: string;
	previousQuantity: number;
	newQuantity: number;
	notes?: string;
	createdBy?: mongoose.Types.ObjectId;
	createdAt: Date;
	deletedAt: Date | null;
}

const stockMovementSchema = new Schema<IStockMovement>(
	{
		productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
		variantName: { type: String, default: null },
		warehouseId: {
			type: Schema.Types.ObjectId,
			ref: 'Warehouse',
			required: true,
		},
		type: {
			type: String,
			enum: ['purchase', 'sale', 'adjustment', 'transfer', 'return', 'damage'],
			required: true,
		},
		quantity: { type: Number, required: true },
		referenceId: { type: Schema.Types.ObjectId },
		referenceType: { type: String },
		previousQuantity: { type: Number, required: true },
		newQuantity: { type: Number, required: true },
		notes: { type: String },
		createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
		deletedAt: { type: Date, default: null },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
	}
);

stockMovementSchema.index({ productId: 1, createdAt: -1 });
stockMovementSchema.index({ warehouseId: 1, createdAt: -1 });
stockMovementSchema.index({ referenceId: 1, referenceType: 1 });
stockMovementSchema.index({ type: 1, createdAt: -1 });

const StockMovement =
	models.StockMovement ||
	model<IStockMovement>('StockMovement', stockMovementSchema);

export default StockMovement;
