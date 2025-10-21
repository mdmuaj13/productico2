import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExpenseEntry from '@/models/ExpenseEntry';
import mongoose from 'mongoose';

// GET /api/expense-books/[id]/stats - Get book statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    // Aggregate entries to calculate stats
    const stats = await ExpenseEntry.aggregate([
      {
        $match: {
          bookId: new mongoose.Types.ObjectId(id),
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

    return NextResponse.json({
      creditTotal,
      debitTotal,
      netBalance
    });
  } catch (error) {
    console.error('Error fetching expense book stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense book stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
