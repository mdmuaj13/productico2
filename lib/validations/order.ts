import { z } from 'zod';

export const productSchema = z.object({
	_id: z.string().min(1, 'Product ID is required'),
	slug: z.string().optional(),
	title: z.string().min(1, 'Product title is required'),
	thumbnail: z.string().optional(),
	basePrice: z.number().nonnegative('Base price must be non-negative'),
	price: z.number().nonnegative('Price must be non-negative'),
	quantity: z.number().positive('Quantity must be positive'),
	variantName: z.string().nullable().optional(),
	variantPrice: z.number().nullable().optional(),
	variantSalePrice: z.number().nullable().optional(),
	warehouseId: z.string().nullable().optional(),
	lineTotal: z.number().nonnegative('Line total must be non-negative'),
});

export const createOrderSchema = z.object({
	customerName: z.string().min(1, 'Customer name is required'),
	customerMobile: z.string().min(1, 'Customer mobile is required'),
	customerEmail: z.string().email().optional().or(z.literal('')),
	customerAddress: z.string().min(1, 'Customer address is required'),
	customerDistrict: z.string().optional(),
	code: z.string().min(1, 'Order code is required'),
	trackingCode: z.string().optional(),
	products: z.array(productSchema).min(1, 'At least one product is required'),
	discount: z.number().nonnegative('Discount must be non-negative').optional().default(0),
	deliveryCost: z.number().nonnegative('Delivery cost must be non-negative').optional().default(0),
	tax: z.number().nonnegative('Tax must be non-negative').optional().default(0),
	paid: z.number().nonnegative('Paid amount must be non-negative').optional().default(0),
	paymentStatus: z.enum(['paid', 'unpaid', 'partial']).optional().default('unpaid'),
	paymentType: z.enum(['cash', 'card', 'bkash', 'nagad', 'rocket', 'bank']).optional().default('cash'),
	status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional().default('pending'),
	remark: z.string().optional(),
	createdById: z.string().min(1).optional()
});
