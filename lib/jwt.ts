import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface JWTPayload {
	userId: string;
	email: string;
	role: string;
	iat?: number;
	exp?: number;
}

export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: '7d',
	});
};

export const verifyToken = (token: string): JWTPayload | null => {
	try {
		const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
		return decoded;
	} catch (error) {
		return null;
	}
};

export const getTokenFromHeader = (authHeader: string | null): string | null => {
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return null;
	}
	return authHeader.substring(7);
};