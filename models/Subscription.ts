import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			enum: ['Free', 'Pro', 'Custom'],
		},
		displayName: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			default: '',
		},
		price: {
			type: Number,
			required: true,
			default: 0,
		},
		billingCycle: {
			type: String,
			enum: ['monthly', 'yearly', 'one-time', 'custom'],
			default: 'monthly',
		},
		features: {
			type: [String],
			default: [],
		},
		permissions: {
			type: mongoose.Schema.Types.Mixed,
			default: {},
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		sortOrder: {
			type: Number,
			default: 0,
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

SubscriptionSchema.index({ name: 1 });
SubscriptionSchema.index({ isActive: 1 });
SubscriptionSchema.index({ deletedAt: 1 });

const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);

export default Subscription;
