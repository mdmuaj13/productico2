import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExpenseEntry from '@/models/ExpenseEntry';
import { updateExpenseEntrySchema } from '@/lib/validations/expense';
import { recalculateBookTotals } from '@/lib/utils/expense';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

// GET /api/expense-entries/[id] - Get single expense entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid entry ID' },
        { status: 400 }
      );
    }

    const entry = await ExpenseEntry.findOne({
      _id: id,
      deletedAt: null
    })
      .populate('bookId', 'name')
      .lean();

    if (!entry) {
      return NextResponse.json(
        { error: 'Expense entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error fetching expense entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense entry', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/expense-entries/[id] - Update expense entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid entry ID' },
        { status: 400 }
      );
    }

    // Get the entry first to know which book to update
    const existingEntry = await ExpenseEntry.findOne({
      _id: id,
      deletedAt: null
    }).lean();

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Expense entry not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateExpenseEntrySchema.parse(body);

    // Convert date string to Date object if provided
    const updateData: Record<string, unknown> = { ...validatedData };
    if (updateData.date) {
      updateData.date = new Date(updateData.date as string);
    }

    const entry = await ExpenseEntry.findOneAndUpdate(
      { _id: id, deletedAt: null },
      updateData,
      { new: true, runValidators: true }
    )
      .populate('bookId', 'name')
      .lean();

    // Recalculate book totals
    await recalculateBookTotals(existingEntry.bookId);

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error updating expense entry:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update expense entry', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/expense-entries/[id] - Soft delete expense entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid entry ID' },
        { status: 400 }
      );
    }

    const entry = await ExpenseEntry.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    ).lean();

    if (!entry) {
      return NextResponse.json(
        { error: 'Expense entry not found' },
        { status: 404 }
      );
    }

    // Recalculate book totals
    await recalculateBookTotals(entry.bookId);

    return NextResponse.json({ message: 'Expense entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense entry', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
