import { z } from 'zod';

export const variantSchema = z.object({
	name: z.string().min(1, 'Variant name is required'),
	price: z.number().min(0, 'Price must be positive'),
	salePrice: z.number().min(0, 'Sale price must be positive').optional(),
});

export const createProductSchema = z.object({
	title: z.string().min(2, 'Title must be at least 2 characters long'),
	slug: z.string().min(2, 'Slug must be at least 2 characters long'),
	thumbnail: z.string().url('Invalid thumbnail URL').optional(),
	images: z.array(z.string().url('Invalid image URL')).default([]),
	description: z.string().optional(),
	shortDetail: z.string().optional(),
	price: z.number().min(0, 'Price must be positive'),
	salePrice: z.number().min(0, 'Sale price must be positive').optional(),
	unit: z.string().default('piece'),
	tags: z.array(z.string()).default([]),
	categoryId: z.string().min(1, 'Category ID is required'),
	variants: z.array(variantSchema).default([]),
});

export const updateProductSchema = z.object({
	title: z.string().min(2, 'Title must be at least 2 characters long').optional(),
	slug: z.string().min(2, 'Slug must be at least 2 characters long').optional(),
	thumbnail: z.string().url('Invalid thumbnail URL').optional(),
	images: z.array(z.string().url('Invalid image URL')).optional(),
	description: z.string().optional(),
	shortDetail: z.string().optional(),
	price: z.number().min(0, 'Price must be positive').optional(),
	salePrice: z.number().min(0, 'Sale price must be positive').optional(),
	unit: z.string().optional(),
	tags: z.array(z.string()).optional(),
	categoryId: z.string().min(1, 'Category ID is required').optional(),
	variants: z.array(variantSchema).optional(),
});

export type CreateProductData = z.infer<typeof createProductSchema>;
export type UpdateProductData = z.infer<typeof updateProductSchema>;
export type VariantData = z.infer<typeof variantSchema>;