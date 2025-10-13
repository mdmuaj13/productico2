import { NextRequest } from 'next/server';
import { getTokenFromHeader, verifyToken } from './jwt';
import { ApiSerializer } from '@/types';
import connectDB from './db';
import User from '@/models/User';

export interface AuthenticatedRequest extends NextRequest {
	user?: {
		id: string;
		email: string;
		role: string;
		name: string;
		image: string | null;
	};
}

export const authenticateToken = async (request: NextRequest) => {
	const authHeader = request.headers.get('authorization');
	const token = getTokenFromHeader(authHeader);

	if (!token) {
		return {
			error: ApiSerializer.error('Access token required', 401),
			user: null,
		};
	}

	const payload = verifyToken(token);
	if (!payload) {
		return {
			error: ApiSerializer.error('Invalid or expired token', 401),
			user: null,
		};
	}

	try {
		await connectDB();
		const user = await User.findById(payload.userId);

		if (!user) {
			return { error: ApiSerializer.error('User not found', 404), user: null };
		}

		return {
			error: null,
			user,
		};
	} catch {
		return {
			error: ApiSerializer.error('Authentication failed', 500),
			user: null,
		};
	}
};
