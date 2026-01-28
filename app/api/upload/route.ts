import { NextRequest } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ApiSerializer } from '@/types';
import { authenticateToken } from '@/lib/auth';
import r2Client, { R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';

interface UploadedImage {
	url: string;
	key: string;
	originalName: string;
}

const ALLOWED_TYPES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/gif',
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

async function uploadFile(file: File, folder: string): Promise<string> {
	const timestamp = Date.now();
	const randomId = Math.random().toString(36).substring(2, 8);
	const extension = file.name.split('.').pop() || 'jpg';
	const fileName = `${folder}/${timestamp}-${randomId}.${extension}`;

	const bytes = await file.arrayBuffer();
	const buffer = Buffer.from(bytes);

	const command = new PutObjectCommand({
		Bucket: R2_BUCKET_NAME,
		Key: fileName,
		Body: buffer,
		ContentType: file.type,
	});

	await r2Client.send(command);

	return fileName;
	// return {
	// 	url: `${R2_PUBLIC_URL}/${fileName}`,
	// 	key: fileName,
	// 	originalName: file.name,
	// };
}

function validateFile(file: File): string | null {
	if (!ALLOWED_TYPES.includes(file.type)) {
		return `Invalid file type for "${file.name}". Only JPEG, PNG, WebP, and GIF are allowed.`;
	}
	if (file.size > MAX_SIZE) {
		return `File "${file.name}" is too large. Maximum size is 10MB.`;
	}
	return null;
}

export async function POST(request: NextRequest) {
	try {
		const { error: authError } = await authenticateToken(request);
		if (authError) return authError;

		const formData = await request.formData();
		const folder = (formData.get('folder') as string) || 'images';

		// Collect files from 'files' field (works for single or multiple)
		const files: File[] = [];

		const uploadedFiles = formData.getAll('files');
		for (const f of uploadedFiles) {
			if (f instanceof File) {
				files.push(f);
			}
		}

		if (files.length === 0) {
			return ApiSerializer.error('No files provided', 400);
		}

		// Validate all files first
		for (const file of files) {
			const validationError = validateFile(file);
			if (validationError) {
				return ApiSerializer.error(validationError, 400);
			}
		}

		// Upload all files
		const uploadedImages = await Promise.all(
			files.map((file) => uploadFile(file, folder)),
		);

		return ApiSerializer.success(
			uploadedImages,
			// {
			// 	images: uploadedImages,
			// 	count: uploadedImages.length,
			// 	folder: folder,
			// },
			`${uploadedImages.length} image(s) uploaded successfully`,
		);
	} catch (error) {
		console.error('Upload error:', error);
		return ApiSerializer.error('Failed to upload images');
	}
}
