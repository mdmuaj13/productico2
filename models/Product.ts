import mongoose, { Schema, model, models } from 'mongoose';
import slugify from 'slugify';

interface IVariant {
	name: string;
	price: number;
	salePrice?: number;
}

interface IProduct {
	title: string;
	slug: string;
	thumbnail?: string;
	images: string[];
	description?: string;
	shortDetail?: string;
	price: number;
	salePrice?: number;
	unit: string;
	tags: string[];
	categoryId: mongoose.Types.ObjectId;
	variants: IVariant[];
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
}

const variantSchema = new Schema<IVariant>({
	name: { type: String, required: true },
	price: { type: Number, required: true },
	salePrice: { type: Number },
});

const productSchema = new Schema<IProduct>(
	{
		title: { type: String, required: true },
		slug: { type: String, unique: true },
		thumbnail: { type: String },
		images: [{ type: String }],
		description: { type: String },
		shortDetail: { type: String },
		price: { type: Number, required: true },
		salePrice: { type: Number },
		unit: { type: String, required: true, default: 'piece' },
		tags: [{ type: String }],
		categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
		variants: [variantSchema],
		deletedAt: { type: Date, default: null },
	},
	{
		timestamps: true,
	}
);

productSchema.pre('save', function (next) {
	if (this.isModified('title') && !this.slug) {
		this.slug = slugify(this.title, { lower: true, strict: true });
	}
	next();
});

productSchema.index({ slug: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ deletedAt: 1 });

const Product = models.Product || model<IProduct>('Product', productSchema);

export default Product;