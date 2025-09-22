import connectDB from '@/lib/db';
import User from '@/models/User';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		await connectDB();

		const body = await request.json();

		if (!body.name || !body.email || !body.password) {
			return ApiSerializer.error('Name, email and password are required', 400);
		}

		const existingUser = await User.findOne({ email: body.email, deletedAt: null });
		if (existingUser) {
			return ApiSerializer.error('User already exists with this email', 409);
		}

		const user = await User.create({
			name: body.name,
			email: body.email,
			password: body.password,
			role: body.role,
			image: body.image,
		});

		const userResponse = {
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			image: user.image,
			createdAt: user.createdAt,
		};

		return ApiSerializer.created(userResponse, 'User created successfully');
	} catch (error) {
		console.log(error);
		return ApiSerializer.error('Failed to create user');
	}
}