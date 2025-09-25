import { Schema, model, models } from 'mongoose';
import slugify from 'slugify';

interface ICategory {
	title: string;
	slug: string;
	description?: string;
	image?: string;
	serialNo: number;
	isActive: boolean;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
	{
		title: {
			type: String,
			required: [true, 'Title is required'],
			trim: true,
			unique: true,
		},
		slug: {
			type: String,
			unique: true,
			index: true,
		},
		description: {
			type: String,
			trim: true,
		},
		image: {
			type: String,
			default: '',
		},
		serialNo: {
			type: Number,
			default: 0,
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
	}
);

categorySchema.pre('save', function (next) {
	if (this.isModified('title')) {
		this.slug = slugify(this.title, { lower: true, strict: true });
	}
	next();
});

categorySchema.index({ slug: 1 });
categorySchema.index({ title: 1 });
categorySchema.index({ serialNo: 1 });
categorySchema.index({ deletedAt: 1 });
categorySchema.index({ isActive: 1 });

const Category = models.Category || model<ICategory>('Category', categorySchema);

export default Category;
