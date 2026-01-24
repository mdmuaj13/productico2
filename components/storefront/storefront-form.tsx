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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const storefrontFormSchema = z.object({
	shopName: z.string().min(1, 'Shop name is required'),
	tagline: z.string().optional(),
	metaTag: z.string().optional(),
	metaTitle: z.string().optional(),
	email: z.string().email('Invalid email').optional().or(z.literal('')),
	phone: z.string().optional(),
	address: z.string().optional(),
});

type StorefrontFormValues = z.infer<typeof storefrontFormSchema>;

export function StorefrontForm() {
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(true);
	const [exists, setExists] = useState(false);

	const form = useForm<StorefrontFormValues>({
		resolver: zodResolver(storefrontFormSchema),
		defaultValues: {
			shopName: '',
			tagline: '',
			metaTag: '',
			metaTitle: '',
			email: '',
			phone: '',
			address: '',
		},
	});

	useEffect(() => {
		const fetchStorefront = async () => {
			try {
				const response = await apiCall('/api/storefront?type=default');
				if (response.status_code === 200 && response.data) {
					setExists(true);
					const { value } = response.data;
					form.reset({
						shopName: value.shopName || '',
						tagline: value.tagline || '',
						metaTag: value.metaTag || '',
						metaTitle: value.metaTitle || '',
						email: value.contactDetails?.email || '',
						phone: value.contactDetails?.phone || '',
						address: value.contactDetails?.address || '',
					});
				}
			} catch (error) {
				console.error('Failed to fetch storefront:', error);
			} finally {
				setFetching(false);
			}
		};

		fetchStorefront();
	}, [form]);

	const onSubmit = async (data: StorefrontFormValues) => {
		setLoading(true);
		try {
			const payload = {
				type: 'default',
				value: {
					shopName: data.shopName,
					tagline: data.tagline,
					metaTag: data.metaTag,
					metaTitle: data.metaTitle,
					contactDetails: {
						email: data.email,
						phone: data.phone,
						address: data.address,
					},
				},
			};

			const response = await apiCall('/api/storefront', {
				method: exists ? 'PUT' : 'POST',
				body: JSON.stringify(payload),
			});

			if (response.status_code === 200 || response.status_code === 201) {
				toast.success(exists ? 'Storefront updated successfully' : 'Storefront created successfully');
				setExists(true);
			} else {
				toast.error(response.message || 'Failed to save storefront');
			}
		} catch (error) {
			console.error('Failed to save storefront:', error);
			toast.error('Failed to save storefront');
		} finally {
			setLoading(false);
		}
	};

	if (fetching) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Storefront Information</CardTitle>
				<CardDescription>
					Configure your storefront details that will be displayed to customers
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
											<Input placeholder="Your shop's tagline" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="metaTitle"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Meta Title</FormLabel>
										<FormControl>
											<Input placeholder="SEO title for your shop" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="metaTag"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Meta Tag</FormLabel>
										<FormControl>
											<Input placeholder="SEO meta description" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Contact Details</h3>
							
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input type="email" placeholder="contact@shop.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone</FormLabel>
										<FormControl>
											<Input placeholder="+1 234 567 8900" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Address</FormLabel>
										<FormControl>
											<Textarea 
												placeholder="123 Main St, City, Country" 
												className="resize-none"
												{...field} 
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Button type="submit" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{exists ? 'Update Storefront' : 'Create Storefront'}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
