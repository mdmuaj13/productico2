import ExpenseEntry from '@/models/ExpenseEntry';
import ExpenseBook from '@/models/ExpenseBook';
import mongoose from 'mongoose';

/**
 * Recalculate and update the totals for an expense book
 * This function aggregates all entries for a book and updates the book's totals
 */
export async function recalculateBookTotals(bookId: string | mongoose.Types.ObjectId) {
  // Aggregate entries to calculate stats
  const stats = await ExpenseEntry.aggregate([
    {
      $match: {
        bookId: new mongoose.Types.ObjectId(bookId.toString()),
        deletedAt: null
      }
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      }
    }
  ]);

  // Calculate totals
  let creditTotal = 0;
  let debitTotal = 0;

  stats.forEach((stat) => {
    if (stat._id === 'credit') {
      creditTotal = stat.total;
    } else if (stat._id === 'debit') {
      debitTotal = stat.total;
    }
  });

  const netBalance = creditTotal - debitTotal;

  // Update the book with new totals
  await ExpenseBook.findByIdAndUpdate(
    bookId,
    {
      creditTotal,
      debitTotal,
      netBalance
    },
    { new: true }
  );

  return {
    creditTotal,
    debitTotal,
    netBalance
  };
}
