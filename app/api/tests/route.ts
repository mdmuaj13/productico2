import connectDB from '@/lib/db';
import Test from '@/models/Test';
import { ApiSerializer } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const page = Number(request.nextUrl.searchParams.get('page')) || 1;
		const limit = Number(request.nextUrl.searchParams.get('limit')) || 10;

		const skip = (page - 1) * limit;

		const tests = await Test.find().skip(skip).limit(limit);
		const total = await Test.countDocuments();

		return ApiSerializer.success({
			data: tests,
			meta: {
				total,
				page,
				limit,
			},
		});
	} catch (e) {
		console.log(e);
		return ApiSerializer.error('Failed to fetch data');
	}
}

export async function POST(request: NextRequest) {
	try {
		await connectDB();

		const body = await request.json();

		if (!body.name || !body.value) {
			return ApiSerializer.error('Name and value are required', 400);
		}

		const test = await Test.create({
			name: body.name,
			value: body.value,
		});

		return ApiSerializer.created(test, 'Test created successfully');
	} catch (error) {
		return ApiSerializer.error('Failed to create test');
	}
}
