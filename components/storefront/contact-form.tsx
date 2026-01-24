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

const contactSchema = z.object({
	email: z.string().email('Invalid email').optional().or(z.literal('')),
	phone: z.string().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	country: z.string().optional(),
	facebook: z.string().url('Invalid URL').optional().or(z.literal('')),
	instagram: z.string().url('Invalid URL').optional().or(z.literal('')),
	twitter: z.string().url('Invalid URL').optional().or(z.literal('')),
	linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
	initialData?: Record<string, unknown>;
	onUpdate?: (data: Record<string, unknown>) => void;
}

export function ContactForm({ initialData, onUpdate }: ContactFormProps) {
	const [loading, setLoading] = useState(false);

	const form = useForm<ContactFormValues>({
		resolver: zodResolver(contactSchema),
		defaultValues: {
			email: '',
			phone: '',
			address: '',
			city: '',
			country: '',
			facebook: '',
			instagram: '',
			twitter: '',
			linkedin: '',
		},
	});

	useEffect(() => {
		if (initialData) {
			const value = initialData as { email?: string; phone?: string; address?: string; city?: string; country?: string; socialLinks?: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string } };
			form.reset({
				email: value.email || '',
				phone: value.phone || '',
				address: value.address || '',
				city: value.city || '',
				country: value.country || '',
				facebook: value.socialLinks?.facebook || '',
				instagram: value.socialLinks?.instagram || '',
				twitter: value.socialLinks?.twitter || '',
				linkedin: value.socialLinks?.linkedin || '',
			});
		}
	}, [initialData, form]);

	const onSubmit = async (data: ContactFormValues) => {
		setLoading(true);
		try {
			const payload = {
				type: 'contact',
				value: {
					email: data.email,
					phone: data.phone,
					address: data.address,
					city: data.city,
					country: data.country,
					socialLinks: {
						facebook: data.facebook,
						instagram: data.instagram,
						twitter: data.twitter,
						linkedin: data.linkedin,
					},
				},
			};

			const response = await apiCall('/api/storefront', {
				method: 'POST',
				body: JSON.stringify(payload),
			});

			if (response.status_code === 200 || response.status_code === 201) {
				toast.success('Contact details saved successfully');
			} else {
				toast.error(response.message || 'Failed to save contact details');
			}
		} catch (error) {
			console.error('Failed to save contact details:', error);
			toast.error('Failed to save contact details');
		} finally {
			setLoading(false);
		}
	};



	return (
		<Card>
			<CardHeader>
				<CardTitle>Contact Details</CardTitle>
				<CardDescription>
					Configure your contact information and social media links
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Contact Information</h3>

							<div className="grid gap-4 md:grid-cols-2">
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
							</div>

							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Address</FormLabel>
										<FormControl>
											<Textarea 
												placeholder="123 Main St" 
												className="resize-none"
												{...field} 
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="city"
									render={({ field }) => (
										<FormItem>
											<FormLabel>City</FormLabel>
											<FormControl>
												<Input placeholder="New York" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="country"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Country</FormLabel>
											<FormControl>
												<Input placeholder="United States" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Social Media Links</h3>

							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="facebook"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Facebook</FormLabel>
											<FormControl>
												<Input placeholder="https://facebook.com/yourshop" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="instagram"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Instagram</FormLabel>
											<FormControl>
												<Input placeholder="https://instagram.com/yourshop" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="twitter"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Twitter</FormLabel>
											<FormControl>
												<Input placeholder="https://twitter.com/yourshop" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="linkedin"
									render={({ field }) => (
										<FormItem>
											<FormLabel>LinkedIn</FormLabel>
											<FormControl>
												<Input placeholder="https://linkedin.com/company/yourshop" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<Button type="submit" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Save Contact Details
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
