'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { createCustomer } from '@/hooks/customers';

interface FormData {
	name: string;
	email: string;
	phone: string;
	company: string;
	address: string;
	city: string;
	country: string;
	postalCode: string;
	isActive: boolean;
}

interface CustomerFormProps {
	onSuccess?: () => void;
}

export function CustomerForm({ onSuccess }: CustomerFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
	const [formData, setFormData] = useState<FormData>({
		name: '',
		email: '',
		phone: '',
		company: '',
		address: '',
		city: '',
		country: '',
		postalCode: '',
		isActive: true,
	});

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const validatePhone = (phone: string): boolean => {
		const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
		return phoneRegex.test(phone);
	};

	const validateForm = (): boolean => {
		const newErrors: Partial<Record<keyof FormData, string>> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Name is required';
		} else if (formData.name.length < 2) {
			newErrors.name = 'Name must be at least 2 characters';
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!validateEmail(formData.email)) {
			newErrors.email = 'Invalid email format';
		}

		if (!formData.phone.trim()) {
			newErrors.phone = 'Phone is required';
		} else if (!validatePhone(formData.phone)) {
			newErrors.phone = 'Invalid phone format';
		}

		if (formData.postalCode && formData.postalCode.length < 3) {
			newErrors.postalCode = 'Postal code must be at least 3 characters';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error for this field
		if (errors[name as keyof FormData]) {
			setErrors((prev) => ({
				...prev,
				[name]: undefined,
			}));
		}
	};

	const handleCheckboxChange = (checked: boolean) => {
		setFormData((prev) => ({
			...prev,
			isActive: checked,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.error('Please fix the validation errors');
			return;
		}

		setIsLoading(true);

		try {
			const submitData = {
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				company: formData.company || undefined,
				address: formData.address || undefined,
				city: formData.city || undefined,
				country: formData.country || undefined,
				postalCode: formData.postalCode || undefined,
				isActive: formData.isActive,
			};

			console.log('Submitting customer data:', submitData);
			await createCustomer(submitData);
			toast.success('Customer created successfully');

			// Reset form
			setFormData({
				name: '',
				email: '',
				phone: '',
				company: '',
				address: '',
				city: '',
				country: '',
				postalCode: '',
				isActive: true,
			});
			setErrors({});

			// Call success callback
			onSuccess?.();
			router.refresh();
		} catch (error) {
			console.error('Error creating customer:', error);
			toast.error(
				error instanceof Error ? error.message : 'Failed to create customer'
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-full space-y-6 p-4 py-8">
			<SheetHeader className="px-0">
				<SheetTitle>Create Customer</SheetTitle>
				<SheetDescription>Add a new customer to your system.</SheetDescription>
			</SheetHeader>

			<form onSubmit={handleSubmit} className="flex-1 space-y-4 py-4 overflow-y-auto">
				<div className="space-y-2">
					<Label htmlFor="name">Name *</Label>
					<Input
						id="name"
						name="name"
						placeholder="Enter customer name"
						value={formData.name}
						onChange={handleChange}
						className={errors.name ? 'border-red-500' : ''}
					/>
					{errors.name && (
						<p className="text-sm text-red-500">{errors.name}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="email">Email *</Label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="Enter email address"
						value={formData.email}
						onChange={handleChange}
						className={errors.email ? 'border-red-500' : ''}
					/>
					{errors.email && (
						<p className="text-sm text-red-500">{errors.email}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="phone">Phone *</Label>
					<Input
						id="phone"
						name="phone"
						type="tel"
						placeholder="Enter phone number"
						value={formData.phone}
						onChange={handleChange}
						className={errors.phone ? 'border-red-500' : ''}
					/>
					{errors.phone && (
						<p className="text-sm text-red-500">{errors.phone}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="company">Company</Label>
					<Input
						id="company"
						name="company"
						placeholder="Enter company name"
						value={formData.company}
						onChange={handleChange}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="address">Address</Label>
					<Textarea
						id="address"
						name="address"
						placeholder="Enter address"
						value={formData.address}
						onChange={handleChange}
						rows={3}
						className="resize-none"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="city">City</Label>
						<Input
							id="city"
							name="city"
							placeholder="Enter city"
							value={formData.city}
							onChange={handleChange}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="country">Country</Label>
						<Input
							id="country"
							name="country"
							placeholder="Enter country"
							value={formData.country}
							onChange={handleChange}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="postalCode">Postal Code</Label>
					<Input
						id="postalCode"
						name="postalCode"
						placeholder="Enter postal code"
						value={formData.postalCode}
						onChange={handleChange}
						className={errors.postalCode ? 'border-red-500' : ''}
					/>
					{errors.postalCode && (
						<p className="text-sm text-red-500">{errors.postalCode}</p>
					)}
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id="isActive"
						checked={formData.isActive}
						onCheckedChange={handleCheckboxChange}
					/>
					<Label htmlFor="isActive">Active Status</Label>
				</div>
			</form>

			<SheetFooter className="gap-2 px-0 mt-auto">
				<Button type="submit" disabled={isLoading} onClick={handleSubmit}>
					{isLoading ? 'Creating...' : 'Create Customer'}
				</Button>
				<SheetClose asChild>
					<Button type="button" variant="outline" disabled={isLoading}>
						Cancel
					</Button>
				</SheetClose>
			</SheetFooter>
		</div>
	);
}
