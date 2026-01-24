'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiCall } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const shopInfoSchema = z.object({
	shopName: z.string().min(1, 'Shop name is required'),
	tagline: z.string().optional(),
	metaTitle: z.string().optional(),
	metaDescription: z.string().optional(),
	metaImage: z.string().url('Invalid URL').optional().or(z.literal('')),
	heroImage: z.string().url('Invalid URL').optional().or(z.literal('')),
	logo: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type ShopInfoFormValues = z.infer<typeof shopInfoSchema>;

interface ShopInfoFormProps {
	initialData?: Record<string, unknown>;
	onUpdate?: (data: Record<string, unknown>) => void;
}

export function ShopInfoForm({ initialData, onUpdate }: ShopInfoFormProps) {
	const [loading, setLoading] = useState(false);

	const form = useForm<ShopInfoFormValues>({
		resolver: zodResolver(shopInfoSchema),
		defaultValues: {
			shopName: '',
			tagline: '',
			metaTitle: '',
			metaDescription: '',
			metaImage: '',
			heroImage: '',
			logo: '',
		},
	});

	useEffect(() => {
		if (initialData) {
			form.reset(initialData as ShopInfoFormValues);
		}
	}, [initialData, form]);

	const onSubmit = async (data: ShopInfoFormValues) => {
		setLoading(true);
		try {
			const payload = {
				type: 'info',
				value: data,
			};

			const response = await apiCall('/api/storefront', {
				method: 'POST',
				body: JSON.stringify(payload),
			});

			if (response.status_code === 200 || response.status_code === 201) {
				toast.success('Shop information saved successfully');
				if (onUpdate) {
					onUpdate(data);
				}
			} else {
				toast.error(response.message || 'Failed to save shop information');
			}
		} catch (error) {
			console.error('Failed to save shop info:', error);
			toast.error('Failed to save shop information');
		} finally {
			setLoading(false);
		}
	};



	return (
		<Card>
			<CardHeader>
				<CardTitle>Shop Information</CardTitle>
				<CardDescription>
					Configure your shop&apos;s basic information and branding
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="shopName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Shop Name *</FormLabel>
										<FormControl>
											<Input placeholder="My Awesome Shop" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="tagline"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tagline</FormLabel>
										<FormControl>
											<Input placeholder="Your shop&apos;s tagline" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="space-y-4">
							<h3 className="text-lg font-semibold">SEO & Meta Information</h3>
							
							<FormField
								control={form.control}
								name="metaTitle"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Meta Title</FormLabel>
										<FormControl>
											<Input placeholder="SEO title for your shop" {...field} />
										</FormControl>
										<FormDescription>
											Displayed in search engine results
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="metaDescription"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Meta Description</FormLabel>
										<FormControl>
											<Input placeholder="Brief description for search engines" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="metaImage"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Meta Image URL</FormLabel>
										<FormControl>
											<Input placeholder="https://example.com/image.jpg" {...field} />
										</FormControl>
										<FormDescription>
											Image shown when sharing your shop on social media
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Branding Assets</h3>

							<FormField
								control={form.control}
								name="logo"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Logo URL</FormLabel>
										<FormControl>
											<Input placeholder="https://example.com/logo.png" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="heroImage"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Hero Image URL</FormLabel>
										<FormControl>
											<Input placeholder="https://example.com/hero.jpg" {...field} />
										</FormControl>
										<FormDescription>
											Main banner image for your storefront
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Button type="submit" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Save Shop Information
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
