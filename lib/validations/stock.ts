import { z } from 'zod';

export const createStockSchema = z.object({
	productId: z.string().min(1, 'Product is required'),
	variantName: z.string().optional().nullable(),
	warehouseId: z.string().min(1, 'Warehouse is required'),
	quantity: z.number().min(0, 'Quantity must be at least 0'),
	reorderPoint: z.number().min(0, 'Reorder point must be at least 0').optional(),
});

export const updateStockSchema = z.object({
	quantity: z.number().min(0, 'Quantity must be at least 0').optional(),
	reorderPoint: z.number().min(0, 'Reorder point must be at least 0').optional(),
});

export type CreateStockData = z.infer<typeof createStockSchema>;
export type UpdateStockData = z.infer<typeof updateStockSchema>;