import { z } from 'zod';

// Shop Info Schema
const infoValueSchema = z.object({
	shopName: z.string().min(1, 'Shop name is required'),
	tagline: z.string().optional(),
	metaTitle: z.string().optional(),
	metaDescription: z.string().optional(),
	metaImage: z.string().url('Invalid URL').optional().or(z.literal('')),
	heroImage: z.string().url('Invalid URL').optional().or(z.literal('')),
	logo: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// Contact Details Schema
const contactValueSchema = z.object({
	email: z.string().email('Invalid email').optional().or(z.literal('')),
	phone: z.string().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	country: z.string().optional(),
	socialLinks: z.object({
		facebook: z.string().url('Invalid URL').optional().or(z.literal('')),
		instagram: z.string().url('Invalid URL').optional().or(z.literal('')),
		twitter: z.string().url('Invalid URL').optional().or(z.literal('')),
		linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
	}).optional(),
});

// Policy Content Schema (for terms, privacy, refund)
const policyValueSchema = z.object({
	content: z.string().min(1, 'Content is required'),
	lastUpdated: z.string().optional(),
});

// Featured Products Schema
const featuredValueSchema = z.object({
	productIds: z.array(z.string()).default([]),
});

// Main Storefront Schema with discriminated union
export const storefrontSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('info'),
		value: infoValueSchema,
	}),
	z.object({
		type: z.literal('contact'),
		value: contactValueSchema,
	}),
	z.object({
		type: z.literal('terms'),
		value: policyValueSchema,
	}),
	z.object({
		type: z.literal('privacy'),
		value: policyValueSchema,
	}),
	z.object({
		type: z.literal('refund'),
		value: policyValueSchema,
	}),
	z.object({
		type: z.literal('featured'),
		value: featuredValueSchema,
	}),
]);

export type StorefrontInput = z.infer<typeof storefrontSchema>;
export type InfoValue = z.infer<typeof infoValueSchema>;
export type ContactValue = z.infer<typeof contactValueSchema>;
export type PolicyValue = z.infer<typeof policyValueSchema>;
export type FeaturedValue = z.infer<typeof featuredValueSchema>;
