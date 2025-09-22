import mongoose from 'mongoose';

const TestSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		value: {
			type: String,
			required: true,
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

const Test = mongoose.models.Test || mongoose.model('Test', TestSchema);

export default Test;
