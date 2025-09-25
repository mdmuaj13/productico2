import { z } from 'zod';

export const createVendorSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters long'),
	contact_number: z.string().min(10, 'Contact number must be at least 10 characters long'),
	email: z.string().email('Invalid email address').optional().or(z.literal('')),
	address: z.string().optional(),
	remarks: z.string().optional(),
});

export const updateVendorSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
	contact_number: z.string().min(10, 'Contact number must be at least 10 characters long').optional(),
	email: z.string().email('Invalid email address').optional().or(z.literal('')),
	address: z.string().optional(),
	remarks: z.string().optional(),
});

export type CreateVendorData = z.infer<typeof createVendorSchema>;
export type UpdateVendorData = z.infer<typeof updateVendorSchema>;