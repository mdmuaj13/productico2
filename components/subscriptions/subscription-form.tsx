'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
	createSubscription,
	updateSubscription,
} from '@/hooks/subscriptions';
import { Switch } from '@/components/ui/switch';

interface ISubscription {
	_id: string;
	name: string;
	displayName: string;
	description?: string;
	price: number;
	billingCycle: string;
	features: string[];
	permissions: any;
	isActive: boolean;
	sortOrder: number;
}

interface SubscriptionFormProps {
	subscription?: ISubscription;
	onSuccess: () => void;
	onCancel: () => void;
}

export default function SubscriptionForm({
	subscription,
	onSuccess,
	onCancel,
}: SubscriptionFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		name: subscription?.name || 'Free',
		displayName: subscription?.displayName || '',
		description: subscription?.description || '',
		price: subscription?.price || 0,
		billingCycle: subscription?.billingCycle || 'monthly',
		features: subscription?.features?.join('\n') || '',
		isActive: subscription?.isActive ?? true,
		sortOrder: subscription?.sortOrder || 0,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const featuresArray = formData.features
				.split('\n')
				.filter((f) => f.trim())
				.map((f) => f.trim());

			const data = {
				...formData,
				features: featuresArray,
				price: Number(formData.price),
				sortOrder: Number(formData.sortOrder),
			};

			if (subscription) {
				await updateSubscription(subscription._id, data);
			} else {
				await createSubscription(data);
			}

			onSuccess();
		} catch (error: any) {
			console.error('Error saving subscription:', error);
			const errorMessage =
				error.response?.data?.error || 'Failed to save subscription plan';
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<SheetHeader>
				<SheetTitle>
					{subscription ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
				</SheetTitle>
			</SheetHeader>

			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="name">Plan Type*</Label>
					<Select
						value={formData.name}
						onValueChange={(value) =>
							setFormData({ ...formData, name: value })
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select plan type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Free">Free</SelectItem>
							<SelectItem value="Pro">Pro</SelectItem>
							<SelectItem value="Custom">Custom</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="displayName">Display Name*</Label>
					<Input
						id="displayName"
						value={formData.displayName}
						onChange={(e) =>
							setFormData({ ...formData, displayName: e.target.value })
						}
						placeholder="e.g., Professional Plan"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						value={formData.description}
						onChange={(e) =>
							setFormData({ ...formData, description: e.target.value })
						}
						placeholder="Brief description of the plan..."
						rows={3}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="price">Price ($)*</Label>
						<Input
							id="price"
							type="number"
							step="0.01"
							min="0"
							value={formData.price}
							onChange={(e) =>
								setFormData({ ...formData, price: parseFloat(e.target.value) })
							}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="billingCycle">Billing Cycle*</Label>
						<Select
							value={formData.billingCycle}
							onValueChange={(value) =>
								setFormData({ ...formData, billingCycle: value })
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="monthly">Monthly</SelectItem>
								<SelectItem value="yearly">Yearly</SelectItem>
								<SelectItem value="one-time">One-time</SelectItem>
								<SelectItem value="custom">Custom</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="features">Features (one per line)</Label>
					<Textarea
						id="features"
						value={formData.features}
						onChange={(e) =>
							setFormData({ ...formData, features: e.target.value })
						}
						placeholder="Unlimited products&#10;Advanced reporting&#10;Priority support"
						rows={6}
					/>
					<p className="text-xs text-muted-foreground">
						Enter each feature on a new line
					</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="sortOrder">Sort Order</Label>
					<Input
						id="sortOrder"
						type="number"
						value={formData.sortOrder}
						onChange={(e) =>
							setFormData({ ...formData, sortOrder: parseInt(e.target.value) })
						}
					/>
					<p className="text-xs text-muted-foreground">
						Lower numbers appear first
					</p>
				</div>

				<div className="flex items-center justify-between">
					<Label htmlFor="isActive">Active Plan</Label>
					<Switch
						id="isActive"
						checked={formData.isActive}
						onCheckedChange={(checked) =>
							setFormData({ ...formData, isActive: checked })
						}
					/>
				</div>
			</div>

			<div className="flex justify-end gap-2 pt-4">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting
						? 'Saving...'
						: subscription
							? 'Update Plan'
							: 'Create Plan'}
				</Button>
			</div>
		</form>
	);
}
