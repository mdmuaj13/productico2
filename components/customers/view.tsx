'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet';
import { deleteCustomer } from '@/hooks/customers';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Edit, Trash2, Mail, Phone, Building2, MapPin } from 'lucide-react';

interface Customer {
	_id: string;
	name: string;
	email: string;
	phone: string;
	company?: string;
	address?: string;
	city?: string;
	country?: string;
	postalCode?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface CustomerViewProps {
	customer: Customer;
	onEdit?: () => void;
	onDelete?: () => void;
	onSuccess?: () => void;
}

export function CustomerView({
	customer,
	onEdit,
	onDelete,
	onSuccess,
}: CustomerViewProps) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		setIsDeleting(true);
		try {
			console.log('Deleting customer:', customer._id);
			await deleteCustomer(customer._id);
			toast.success('Customer deleted successfully');
			onSuccess?.();
			onDelete?.();
		} catch (error) {
			console.error('Error deleting customer:', error);
			toast.error('Failed to delete customer');
		} finally {
			setIsDeleting(false);
			setDeleteDialogOpen(false);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<>
			<div className="flex flex-col h-full space-y-6 p-4 py-8">
				<SheetHeader className="px-0">
					<SheetTitle>Customer Details</SheetTitle>
					<SheetDescription>
						View customer information and manage actions.
					</SheetDescription>
				</SheetHeader>

				<div className="flex-1 space-y-6 py-4">
					<div className="grid grid-cols-1 gap-4">
						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground">
								Customer Name
							</Label>
							<div className="p-3 bg-muted/50 rounded-md">
								<p className="text-sm font-medium">{customer.name}</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<Mail className="h-4 w-4" />
								Email
							</Label>
							<div className="p-3 bg-muted/50 rounded-md">
								<a
									href={`mailto:${customer.email}`}
									className="text-sm text-blue-600 hover:underline"
								>
									{customer.email}
								</a>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<Phone className="h-4 w-4" />
								Phone
							</Label>
							<div className="p-3 bg-muted/50 rounded-md">
								<a
									href={`tel:${customer.phone}`}
									className="text-sm text-blue-600 hover:underline"
								>
									{customer.phone}
								</a>
							</div>
						</div>

						{customer.company && (
							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
									<Building2 className="h-4 w-4" />
									Company
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<p className="text-sm">{customer.company}</p>
								</div>
							</div>
						)}

						{customer.address && (
							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
									<MapPin className="h-4 w-4" />
									Address
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<p className="text-sm whitespace-pre-wrap">
										{customer.address}
									</p>
								</div>
							</div>
						)}

						{(customer.city || customer.country || customer.postalCode) && (
							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Location
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<p className="text-sm">
										{[customer.city, customer.country, customer.postalCode]
											.filter(Boolean)
											.join(', ')}
									</p>
								</div>
							</div>
						)}

						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground">
								Status
							</Label>
							<div className="p-3 bg-muted/50 rounded-md">
								<Badge variant={customer.isActive ? 'default' : 'secondary'}>
									{customer.isActive ? 'Active' : 'Inactive'}
								</Badge>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Created
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<p className="text-sm">{formatDate(customer.createdAt)}</p>
								</div>
							</div>

							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Last Updated
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<p className="text-sm">{formatDate(customer.updatedAt)}</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<SheetFooter className="gap-2 px-0 mt-auto">
					<div className="flex gap-2 w-full">
						<Button
							type="button"
							variant="outline"
							onClick={onEdit}
							className="flex-1 items-center gap-2">
							<Edit className="h-4 w-4" />
							Edit
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleDeleteClick}
							className="flex-1 items-center gap-2">
							<Trash2 className="h-4 w-4" />
							Delete
						</Button>
					</div>
					<SheetClose asChild>
						<Button type="button" variant="outline">
							Close
						</Button>
					</SheetClose>
				</SheetFooter>
			</div>

			{/* Delete Confirmation Dialog */}
			<ConfirmationDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={handleDeleteConfirm}
				title="Delete Customer"
				description={`Are you sure you want to delete "${customer.name}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				isLoading={isDeleting}
			/>
		</>
	);
}
