import { z } from 'zod';

export const createStockSchema = z.object({
	productId: z.string().min(1, 'Product is required'),
	variantName: z.string().optional().nullable(),
	warehouseId: z.string().min(1, 'Warehouse is required'),
	quantity: z.number().min(0, 'Quantity must be at least 0'),
	reorderPoint: z.number().min(0, 'Reorder point must be at least 0').optional().default(0),
});

export const createBulkStockSchema = z.object({
	productId: z.string().min(1, 'Product is required'),
	warehouseId: z.string().min(1, 'Warehouse is required'),
	variants: z.array(z.object({
		variantName: z.string().optional().nullable(),
		quantity: z.number().min(0, 'Quantity must be at least 0'),
		reorderPoint: z.number().min(0, 'Reorder point must be at least 0').optional().default(0),
	})).min(1, 'At least one variant is required'),
});

export const updateStockSchema = z.object({
	quantity: z.number().min(0, 'Quantity must be at least 0').optional(),
	reorderPoint: z.number().min(0, 'Reorder point must be at least 0').optional(),
});

export type CreateStockData = z.infer<typeof createStockSchema>;
export type CreateBulkStockData = z.infer<typeof createBulkStockSchema>;
export type UpdateStockData = z.infer<typeof updateStockSchema>;