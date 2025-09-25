import { NextRequest } from 'next/server';
import { ApiSerializer } from '@/types';
import { authenticateToken } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		const formData = await request.formData();
		const file = formData.get('file') as File;
		const folder = (formData.get('folder') as string) || 'images';
		const cloudinary_path = process.env.CLOUDINARY_PATH || "producticodemo";
		const path = `${cloudinary_path}/${folder}`;

		if (!file) {
			return ApiSerializer.error('No file provided', 400);
		}

		const allowedTypes = [
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/webp',
			'image/gif',
		];
		if (!allowedTypes.includes(file.type)) {
			return ApiSerializer.error(
				'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
				400
			);
		}

		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			return ApiSerializer.error(
				'File size too large. Maximum size is 10MB.',
				400
			);
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		const result = await new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						folder: path,
						resource_type: 'image',
					},
					(error, result) => {
						if (error) reject(error);
						else resolve(result);
					}
				)
				.end(buffer);
		});

		console.log(result);

		return ApiSerializer.success(
			{
				url: (result as any).secure_url,
				public_id: (result as any).public_id,
				folder: path,
			},
			'Image uploaded successfully'
		);
	} catch (error) {
		console.error('Upload error:', error);
		return ApiSerializer.error('Failed to upload image');
	}
}
