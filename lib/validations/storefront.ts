import { z } from 'zod';

export const storefrontSchema = z.object({
	type: z.string().min(1, 'Type is required').default('default'),
	value: z.object({
		shopName: z.string().min(1, 'Shop name is required'),
		tagline: z.string().optional(),
		metaTag: z.string().optional(),
		metaTitle: z.string().optional(),
		contactDetails: z.object({
			email: z.string().email('Invalid email').optional(),
			phone: z.string().optional(),
			address: z.string().optional(),
		}).optional(),
	}),
});

export type StorefrontInput = z.infer<typeof storefrontSchema>;
