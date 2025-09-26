import { z } from 'zod';

export const createPurchaseOrderSchema = z.object({
	po_date: z.string().or(z.date()).transform((val) => new Date(val)),
	vendor_id: z.string().optional(),
	title: z.string().min(2, 'Title must be at least 2 characters long').trim(),
	order_info: z.string().trim().optional(),
	price: z.number().min(0, 'Price must be positive'),
	status: z.enum(['pending', 'approved', 'received', 'cancelled']).default('pending'),

	// Vendor creation fields (used when vendor_id is null)
	vendor_name: z.string().min(2, 'Vendor name must be at least 2 characters long').optional(),
	vendor_contact_number: z.string().min(10, 'Contact number must be at least 10 characters long').optional(),
	vendor_email: z.string().email('Invalid email address').optional().or(z.literal('')),
	vendor_address: z.string().optional(),
	vendor_remarks: z.string().optional(),
});

export const updatePurchaseOrderSchema = z.object({
	po_date: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
	vendor_id: z.string().optional(),
	title: z.string().min(2, 'Title must be at least 2 characters long').trim().optional(),
	order_info: z.string().trim().optional(),
	price: z.number().min(0, 'Price must be positive').optional(),
	status: z.enum(['pending', 'approved', 'received', 'cancelled']).optional(),
});

export type CreatePurchaseOrderData = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderData = z.infer<typeof updatePurchaseOrderSchema>;