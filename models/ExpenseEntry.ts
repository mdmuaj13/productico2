import mongoose, { Schema, Document, Model } from 'mongoose';

export type EntryType = 'credit' | 'debit';

export interface IExpenseEntry extends Document {
  _id: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  type: EntryType;
  amount: number;
  date: Date;
  time?: string;
  remark?: string;
  category?: string;
  userId?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseEntrySchema: Schema<IExpenseEntry> = new Schema(
  {
    bookId: {
      type: Schema.Types.ObjectId,
      ref: 'ExpenseBook',
      required: [true, 'Book ID is required']
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: [true, 'Entry type is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    time: {
      type: String,
      trim: true
    },
    remark: {
      type: String,
      trim: true,
      maxlength: [500, 'Remark cannot exceed 500 characters']
    },
    category: {
      type: String,
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters']
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

// Indexes for faster queries
ExpenseEntrySchema.index({ bookId: 1, deletedAt: 1, date: -1 });
ExpenseEntrySchema.index({ type: 1, deletedAt: 1 });
ExpenseEntrySchema.index({ userId: 1, deletedAt: 1 });
ExpenseEntrySchema.index({ category: 1, deletedAt: 1 });

// Prevent duplicate model registration
const ExpenseEntry: Model<IExpenseEntry> =
  mongoose.models.ExpenseEntry || mongoose.model<IExpenseEntry>('ExpenseEntry', ExpenseEntrySchema);

export default ExpenseEntry;
