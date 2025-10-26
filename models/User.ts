import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			default: 'admin',
		},
		image: {
			type: String,
			default: null,
		},
		subscription: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Subscription',
			default: null,
		},
		subscriptionOverride: {
			type: mongoose.Schema.Types.Mixed,
			default: null,
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

UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	this.password = await bcrypt.hash(this.password, 12);
	next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string) {
	return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;