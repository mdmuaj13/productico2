import { z } from 'zod';

const publicOrderItemSchema = z.object({
	productId: z.string().min(1, 'Product ID is required'),
	variantName: z.string().optional(),
	quantity: z
		.number()
		.int('Quantity must be a whole number')
		.positive('Quantity must be at least 1'),
});

export const publicOrderSchema = z.object({
	items: z.array(publicOrderItemSchema).min(1, 'At least one item is required'),
	discountCode: z.string().optional(),
	name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
	email: z.string().email('Invalid email address').optional(),
	phone: z.string().min(1, 'Phone is required').max(20, 'Phone is too long'),
	address: z
		.string()
		.min(1, 'Address is required')
		.max(500, 'Address is too long'),
	city: z.string().min(1, 'City is required').max(100, 'City is too long'),
});

export type PublicOrderInput = z.infer<typeof publicOrderSchema>;
