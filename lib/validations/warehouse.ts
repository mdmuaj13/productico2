import { z } from 'zod';

export const createWarehouseSchema = z.object({
	title: z.string().min(2, 'Title must be at least 2 characters long'),
	description: z.string().optional(),
	address: z.string().min(2, 'Address must be at least 2 characters long').optional(),
});

export const updateWarehouseSchema = z.object({
	title: z.string().min(2, 'Title must be at least 2 characters long').optional(),
	slug: z.string().min(2, 'Slug must be at least 2 characters long').optional(),
	description: z.string().optional(),
	address: z.string().min(2, 'Address must be at least 2 characters long').optional(),
});

export type CreateWarehouseData = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseData = z.infer<typeof updateWarehouseSchema>;