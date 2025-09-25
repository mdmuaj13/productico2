import { z } from 'zod';

export const createCategorySchema = z.object({
	title: z.string().min(2, 'Title must be at least 2 characters long').trim(),
	slug: z.string().min(2, 'Slug must be at least 2 characters long').optional(),
	description: z.string().trim().optional(),
	image: z.string().url('Invalid image URL').or(z.literal('')).optional(),
	serialNo: z.number().min(0, 'Serial number must be positive').default(0),
	isActive: z.boolean().default(true),
});

export const updateCategorySchema = z.object({
	title: z.string().min(2, 'Title must be at least 2 characters long').trim().optional(),
	slug: z.string().min(2, 'Slug must be at least 2 characters long').optional(),
	description: z.string().trim().optional(),
	image: z.string().url('Invalid image URL').or(z.literal('')).optional(),
	serialNo: z.number().min(0, 'Serial number must be positive').optional(),
	isActive: z.boolean().optional(),
});

export type CreateCategoryData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>;