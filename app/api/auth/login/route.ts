import connectDB from '@/lib/db';
import User from '@/models/User';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
	try {
		await connectDB();

		const body = await request.json();

		if (!body.email || !body.password) {
			return ApiSerializer.error('Email and password are required', 400);
		}

		const user = await User.findOne({ email: body.email, deletedAt: null });
		if (!user) {
			return ApiSerializer.error('Invalid email or password', 401);
		}

		const isPasswordValid = await user.comparePassword(body.password);
		if (!isPasswordValid) {
			return ApiSerializer.error('Invalid email or password', 401);
		}

		const token = generateToken({
			userId: user._id.toString(),
			email: user.email,
			role: user.role,
		});

		const userResponse = {
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				image: user.image,
			},
			token,
		};

		return ApiSerializer.success(userResponse, 'Login successful');
	} catch (error) {
		console.log(error);
		return ApiSerializer.error('Failed to login');
	}
}
