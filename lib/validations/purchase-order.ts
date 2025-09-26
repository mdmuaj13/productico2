import { z } from 'zod';

export const createPurchaseOrderSchema = z.object({
	title: z.string().min(2, 'Title must be at least 2 characters long'),
	po_date: z.string().min(1, 'PO date is required'),
	vendor_id: z.string().optional(),
	order_info: z.string().optional(),
	price: z.number().min(0, 'Price must be a positive number'),
	status: z.enum(['pending', 'approved', 'received', 'cancelled'], {
		required_error: 'Status is required',
	}),
});

export const updatePurchaseOrderSchema = z.object({
	title: z.string().min(2, 'Title must be at least 2 characters long').optional(),
	po_date: z.string().optional(),
	vendor_id: z.string().optional(),
	order_info: z.string().optional(),
	price: z.number().min(0, 'Price must be a positive number').optional(),
	status: z.enum(['pending', 'approved', 'received', 'cancelled']).optional(),
});

export type CreatePurchaseOrderData = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderData = z.infer<typeof updatePurchaseOrderSchema>;