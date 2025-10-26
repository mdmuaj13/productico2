import { z } from 'zod';

export const createSubscriptionSchema = z.object({
	name: z.enum(['Free', 'Pro', 'Custom']),
	displayName: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
	price: z.number().min(0),
	billingCycle: z.enum(['monthly', 'yearly', 'one-time', 'custom']),
	features: z.array(z.string()).optional(),
	permissions: z.record(z.any()).optional(),
	isActive: z.boolean().optional(),
	sortOrder: z.number().optional(),
});

export const updateSubscriptionSchema = z.object({
	name: z.enum(['Free', 'Pro', 'Custom']).optional(),
	displayName: z.string().min(1).max(100).optional(),
	description: z.string().max(500).optional(),
	price: z.number().min(0).optional(),
	billingCycle: z.enum(['monthly', 'yearly', 'one-time', 'custom']).optional(),
	features: z.array(z.string()).optional(),
	permissions: z.record(z.any()).optional(),
	isActive: z.boolean().optional(),
	sortOrder: z.number().optional(),
});

export const assignSubscriptionSchema = z.object({
	userId: z.string().min(1),
	subscriptionId: z.string().min(1),
	subscriptionOverride: z.record(z.any()).optional().nullable(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type AssignSubscriptionInput = z.infer<typeof assignSubscriptionSchema>;
