import { z } from 'zod';

export const createDiscountSchema = z.object({
	code: z
		.string()
		.min(2, 'Code must be at least 2 characters')
		.max(30, 'Code must be at most 30 characters')
		.trim()
		.transform((val) => val.toUpperCase()),
	type: z.enum(['percentage', 'fixed'], {
		message: 'Type must be "percentage" or "fixed"',
	}),
	value: z.number().positive('Value must be positive'),
	minOrderAmount: z
		.number()
		.min(0, 'Minimum order amount must be positive')
		.default(0)
		.optional(),
	maxUses: z
		.number()
		.int()
		.positive('Max uses must be a positive integer')
		.optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	isActive: z.boolean().default(true).optional(),
});

export const updateDiscountSchema = z.object({
	code: z
		.string()
		.min(2, 'Code must be at least 2 characters')
		.max(30, 'Code must be at most 30 characters')
		.trim()
		.transform((val) => val.toUpperCase())
		.optional(),
	type: z.enum(['percentage', 'fixed']).optional(),
	value: z.number().positive('Value must be positive').optional(),
	minOrderAmount: z
		.number()
		.min(0, 'Minimum order amount must be positive')
		.optional(),
	maxUses: z
		.number()
		.int()
		.positive('Max uses must be a positive integer')
		.nullable()
		.optional(),
	startDate: z.coerce.date().nullable().optional(),
	endDate: z.coerce.date().nullable().optional(),
	isActive: z.boolean().optional(),
});

export type CreateDiscountData = z.infer<typeof createDiscountSchema>;
export type UpdateDiscountData = z.infer<typeof updateDiscountSchema>;
