import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExpenseEntry from '@/models/ExpenseEntry';
import { createExpenseEntrySchema } from '@/lib/validations/expense';
import { ZodError } from 'zod';

// GET /api/expense-entries - Get all expense entries
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const bookId = searchParams.get('bookId');
    const type = searchParams.get('type'); // 'credit' or 'debit'
    const category = searchParams.get('category');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { deletedAt: null };

    if (bookId) {
      query.bookId = bookId;
    }

    if (type && (type === 'credit' || type === 'debit')) {
      query.type = type;
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { remark: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await ExpenseEntry.countDocuments(query);

    // Get entries
    const entries = await ExpenseEntry.find(query)
      .populate('bookId', 'name')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      data: entries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching expense entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense entries', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/expense-entries - Create new expense entry
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const validatedData = createExpenseEntrySchema.parse(body);

    // Convert date string to Date object
    const entryData = {
      ...validatedData,
      date: new Date(validatedData.date)
    };

    const entry = await ExpenseEntry.create(entryData);

    // Populate book info
    const populatedEntry = await ExpenseEntry.findById(entry._id)
      .populate('bookId', 'name')
      .lean();

    return NextResponse.json(populatedEntry, { status: 201 });
  } catch (error: any) {
    console.error('Error creating expense entry:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create expense entry', details: error.message },
      { status: 500 }
    );
  }
}
