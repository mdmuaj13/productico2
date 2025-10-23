import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExpenseBook from '@/models/ExpenseBook';
import { updateExpenseBookSchema } from '@/lib/validations/expense';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

// GET /api/expense-books/[id] - Get single expense book
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

    const book = await ExpenseBook.findOne({
      _id: id,
      deletedAt: null
    }).lean();

    if (!book) {
      return NextResponse.json(
        { error: 'Expense book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error: any) {
    console.error('Error fetching expense book:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense book', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/expense-books/[id] - Update expense book
export async function PUT(
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

    const body = await request.json();
    const validatedData = updateExpenseBookSchema.parse(body);

    const book = await ExpenseBook.findOneAndUpdate(
      { _id: id, deletedAt: null },
      validatedData,
      { new: true, runValidators: true }
    ).lean();

    if (!book) {
      return NextResponse.json(
        { error: 'Expense book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error: any) {
    console.error('Error updating expense book:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update expense book', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/expense-books/[id] - Soft delete expense book
export async function DELETE(
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

    const book = await ExpenseBook.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    ).lean();

    if (!book) {
      return NextResponse.json(
        { error: 'Expense book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Expense book deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting expense book:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense book', details: error.message },
      { status: 500 }
    );
  }
}
