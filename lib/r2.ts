import { S3Client } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
	region: 'auto',
	endpoint: process.env.R2_ENDPOINT!,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID!,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
	},
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export function isUrl(value?: string) {
	if (!value) return false
	try {
	  new URL(value)
	  return true
	} catch {
	  return false
	}
  }
  

export default r2Client;
