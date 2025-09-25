'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet';
import { deleteVendor } from '@/hooks/vendors';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Edit, Trash2 } from 'lucide-react';

interface Vendor {
	_id: string;
	name: string;
	contact_number: string;
	email?: string;
	address?: string;
	remarks?: string;
	createdAt: string;
	updatedAt: string;
}

interface VendorViewProps {
	vendor: Vendor;
	onEdit?: () => void;
	onDelete?: () => void;
	onSuccess?: () => void;
}

export function VendorView({
	vendor,
	onEdit,
	onDelete,
	onSuccess,
}: VendorViewProps) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		setIsDeleting(true);
		try {
			await deleteVendor(vendor._id);
			toast.success('Vendor deleted successfully');
			onSuccess?.();
			onDelete?.();
		} catch {
			toast.error('Failed to delete vendor');
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
					<SheetTitle>Vendor Details</SheetTitle>
					<SheetDescription>
						View vendor information and manage actions.
					</SheetDescription>
				</SheetHeader>

				<div className="flex-1 space-y-6 py-4">
					<div className="grid grid-cols-1 gap-4">
						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground">
								Vendor Name
							</Label>
							<div className="p-3 bg-muted/50 rounded-md">
								<p className="text-sm">{vendor.name}</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground">
								Contact Number
							</Label>
							<div className="p-3 bg-muted/50 rounded-md">
								<p className="text-sm">{vendor.contact_number}</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground">
								Email
							</Label>
							<div className="p-3 bg-muted/50 rounded-md">
								<p className="text-sm">{vendor.email || 'Not provided'}</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground">
								Address
							</Label>
							<div className="p-3 bg-muted/50 rounded-md">
								<p className="text-sm whitespace-pre-wrap">
									{vendor.address || 'Not provided'}
								</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground">
								Remarks
							</Label>
							<div className="p-3 bg-muted/50 rounded-md">
								<p className="text-sm whitespace-pre-wrap">
									{vendor.remarks || 'No remarks'}
								</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Created
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<p className="text-sm">{formatDate(vendor.createdAt)}</p>
								</div>
							</div>

							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Last Updated
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<p className="text-sm">{formatDate(vendor.updatedAt)}</p>
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
				title="Delete Vendor"
				description={`Are you sure you want to delete "${vendor.name}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				isLoading={isDeleting}
			/>
		</>
	);
}
