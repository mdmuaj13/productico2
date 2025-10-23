import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExpenseBook from '@/models/ExpenseBook';
import { createExpenseBookSchema } from '@/lib/validations/expense';
import { ZodError } from 'zod';

// GET /api/expense-books - Get all expense books
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { deletedAt: null };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await ExpenseBook.countDocuments(query);

    // Get books
    const books = await ExpenseBook.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      data: books,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching expense books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense books', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/expense-books - Create new expense book
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const validatedData = createExpenseBookSchema.parse(body);

    const book = await ExpenseBook.create(validatedData);

    return NextResponse.json(book, { status: 201 });
  } catch (error: any) {
    console.error('Error creating expense book:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create expense book', details: error.message },
      { status: 500 }
    );
  }
}
