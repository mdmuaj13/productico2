'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { useVendors, deleteVendor } from '@/hooks/vendors';
import { VendorForm } from './create';
import { VendorEditForm } from './edit-form';
import { VendorView } from './view';
import { toast } from 'sonner';
import { SimpleTable } from '@/components/simple-table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Spinner } from '../ui/shadcn-io/spinner';

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

export function VendorsList() {
	const [createSheetOpen, setCreateSheetOpen] = useState(false);
	const [editSheetOpen, setEditSheetOpen] = useState(false);
	const [viewSheetOpen, setViewSheetOpen] = useState(false);
	const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
	const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingVendor, setDeletingVendor] = useState<Vendor | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const {
		data: vendorsData,
		error,
		mutate: mutateVendors,
	} = useVendors({
		page: 1,
		limit: 10,
	});

	const vendors = vendorsData?.data || [];
	const meta = vendorsData?.meta;

	console.log('Vendors data:', vendors);

	const handleDeleteClick = (vendor: Vendor) => {
		setDeletingVendor(vendor);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!deletingVendor) return;

		setIsDeleting(true);
		try {
			await deleteVendor(deletingVendor._id);
			toast.success('Vendor deleted successfully');
			mutateVendors();
		} catch {
			toast.error('Failed to delete vendor');
		} finally {
			setIsDeleting(false);
			setDeleteDialogOpen(false);
			setDeletingVendor(null);
		}
	};

	const handleViewVendor = (vendor: Vendor) => {
		console.log('View vendor clicked:', vendor);
		setViewingVendor(vendor);
		setViewSheetOpen(true);
	};

	const handleEditVendor = (vendor: Vendor) => {
		setEditingVendor(vendor);
		setEditSheetOpen(true);
	};

	const handleViewToEdit = () => {
		if (viewingVendor) {
			setViewSheetOpen(false);
			setEditingVendor(viewingVendor);
			setEditSheetOpen(true);
		}
	};

	const handleViewToDelete = () => {
		setViewSheetOpen(false);
		mutateVendors();
	};

	const handleCreateSuccess = () => {
		setCreateSheetOpen(false);
		mutateVendors();
	};

	const handleEditSuccess = () => {
		setEditSheetOpen(false);
		setEditingVendor(null);
		mutateVendors();
	};

	const handleViewSuccess = () => {
		setViewSheetOpen(false);
		setViewingVendor(null);
		mutateVendors();
	};

	const columns = [
		{
			key: 'name',
			header: 'Name',
		},
		{
			key: 'contact_number',
			header: 'Contact Number',
		},
		{
			key: 'email',
			header: 'Email',
			render: (value: unknown) => (
				<span className="max-w-xs truncate block">
					{value ? String(value) : '-'}
				</span>
			),
		},
		{
			key: 'address',
			header: 'Address',
			render: (value: unknown) => (
				<span className="max-w-xs truncate block">
					{value ? String(value) : '-'}
				</span>
			),
		},
		{
			key: 'createdAt',
			header: 'Created',
			render: (value: unknown) => new Date(String(value)).toLocaleDateString(),
		},
	];

	const actions = [
		{
			label: 'View',
			onClick: (vendor: Vendor) => {
				handleViewVendor(vendor);
			},
			variant: 'secondary' as const,
		},
		{
			label: 'Edit',
			onClick: (vendor: Vendor) => handleEditVendor(vendor),
			variant: 'outline' as const,
		},
		{
			label: 'Delete',
			onClick: (vendor: Vendor) => handleDeleteClick(vendor),
			variant: 'destructive' as const,
		},
	];

	console.log('Actions:', actions);

	if (error) {
		return (
			<Card>
				<CardContent className="p-6">
					<p className="text-center text-red-500">Failed to load vendors</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Vendors ({meta?.total || 0})</h1>
				<div className="flex items-center gap-2">
					<Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
						<SheetTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Add Vendor
							</Button>
						</SheetTrigger>
						<SheetContent>
							<div className="h-full">
								<VendorForm onSuccess={handleCreateSuccess} />
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			{/* Vendors Table */}
			<Card>
				<CardContent>
					{!vendorsData && !error ? (
						<div className="flex items-center justify-center py-8">
							<Spinner variant="pinwheel" />
						</div>
					) : vendors.length === 0 ? (
						<div className="flex items-center justify-center py-8">
							<p>No vendors found</p>
						</div>
					) : (
						<SimpleTable
							data={vendors}
							columns={columns}
							actions={actions}
							showPagination={false}
						/>
					)}
				</CardContent>
			</Card>

			{/* View Sheet */}
			<Sheet open={viewSheetOpen} onOpenChange={setViewSheetOpen}>
				<SheetContent>
					<div className="h-full">
						{viewingVendor && (
							<VendorView
								vendor={viewingVendor}
								onEdit={handleViewToEdit}
								onDelete={handleViewToDelete}
								onSuccess={handleViewSuccess}
							/>
						)}
					</div>
				</SheetContent>
			</Sheet>

			{/* Edit Sheet */}
			<Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
				<SheetContent>
					<div className="h-full">
						{editingVendor && (
							<VendorEditForm
								vendor={editingVendor}
								onSuccess={handleEditSuccess}
							/>
						)}
					</div>
				</SheetContent>
			</Sheet>

			{/* Delete Confirmation Dialog */}
			<ConfirmationDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={handleDeleteConfirm}
				title="Delete Vendor"
				description={`Are you sure you want to delete "${deletingVendor?.name}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				isLoading={isDeleting}
			/>
		</div>
	);
}
