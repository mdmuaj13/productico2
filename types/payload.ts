import { NextResponse } from 'next/server';

interface ApiResponse<T = any> {
	status_code: number;
	message: string;
	data?: T;
	meta?: {
		total: number;
		page: number;
		limit: number;
	};
}

export class ApiSerializer {
	static success(data: any, message = 'Success', meta?: any) {
		const response: ApiResponse = {
			status_code: 200,
			message,
			data,
		};

		if (meta) response.meta = meta;

		return NextResponse.json(response);
	}

	static created(data: any, message = 'Created successfully') {
		return NextResponse.json({
			status_code: 201,
			message,
			data,
		});
	}

	static error(message = 'Error', statusCode = 500) {
		return NextResponse.json(
			{
				status_code: statusCode,
				message,
			},
			{ status: statusCode }
		);
	}

	static notFound(message = 'Not found') {
		return NextResponse.json(
			{
				status_code: 404,
				message,
			},
			{ status: 404 }
		);
	}
}
