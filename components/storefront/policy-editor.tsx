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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const policySchema = z.object({
	content: z.string().min(1, 'Content is required'),
});

type PolicyFormValues = z.infer<typeof policySchema>;

interface PolicyEditorProps {
	type: 'terms' | 'privacy' | 'refund';
	title: string;
	initialData?: Record<string, unknown>;
	onUpdate?: (data: Record<string, unknown>) => void;
}

export function PolicyEditor({ type, title, initialData, onUpdate }: PolicyEditorProps) {
	const [loading, setLoading] = useState(false);

	const form = useForm<PolicyFormValues>({
		resolver: zodResolver(policySchema),
		defaultValues: {
			content: '',
		},
	});

	useEffect(() => {
		if (initialData) {
			const value = initialData as { content?: string };
			form.reset({
				content: value.content || '',
			});
		}
	}, [initialData, form]);

	const onSubmit = async (data: PolicyFormValues) => {
		setLoading(true);
		try {
			const payload = {
				type,
				value: {
					content: data.content,
					lastUpdated: new Date().toISOString(),
				},
			};

			const response = await apiCall('/api/storefront', {
				method: 'POST',
				body: JSON.stringify(payload),
			});

			if (response.status_code === 200 || response.status_code === 201) {
				toast.success(`${title} saved successfully`);
				if (onUpdate) {
					onUpdate(payload.value);
				}
			} else {
				toast.error(response.message || `Failed to save ${title}`);
			}
		} catch (error) {
			console.error(`Failed to save ${type}:`, error);
			toast.error(`Failed to save ${title}`);
		} finally {
			setLoading(false);
		}
	};



	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>
					Write or update your {title.toLowerCase()} content
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Content</FormLabel>
									<FormControl>
										<Textarea 
											placeholder={`Enter your ${title.toLowerCase()} here...`}
											className="min-h-[400px] resize-y font-mono text-sm"
											{...field} 
										/>
									</FormControl>
									<FormDescription>
										You can use plain text or markdown formatting
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Save {title}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
