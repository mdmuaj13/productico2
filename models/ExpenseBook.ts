import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpenseBook extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  userId?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseBookSchema: Schema<IExpenseBook> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Book name is required'],
      trim: true,
      maxlength: [100, 'Book name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for faster queries
ExpenseBookSchema.index({ deletedAt: 1, createdAt: -1 });
ExpenseBookSchema.index({ userId: 1, deletedAt: 1 });

// Virtual for entries
ExpenseBookSchema.virtual('entries', {
  ref: 'ExpenseEntry',
  localField: '_id',
  foreignField: 'bookId'
});

// Prevent duplicate model registration
const ExpenseBook: Model<IExpenseBook> =
  mongoose.models.ExpenseBook || mongoose.model<IExpenseBook>('ExpenseBook', ExpenseBookSchema);

export default ExpenseBook;
