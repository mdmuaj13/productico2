import { authenticateToken } from '@/lib/auth';
import { ApiSerializer } from '@/types';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		const { error, user } = await authenticateToken(request);

		if (error) {
			return error;
		}
		const data = { ...user.toJSON(), password: null };

		return ApiSerializer.success(data, 'User data retrieved successfully');
	} catch (error) {
		console.log(error);
		return ApiSerializer.error('Failed to fetch user data');
	}
}
