'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { useCustomers, deleteCustomer } from '@/hooks/customers';
import { CustomerForm } from './create';
import { CustomerEditForm } from './edit-form';
import { CustomerView } from './view';
import { toast } from 'sonner';
import { SimpleTable } from '@/components/simple-table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Spinner } from '../ui/shadcn-io/spinner';
import { Badge } from '@/components/ui/badge';

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

export function CustomersList() {
	const [createSheetOpen, setCreateSheetOpen] = useState(false);
	const [editSheetOpen, setEditSheetOpen] = useState(false);
	const [viewSheetOpen, setViewSheetOpen] = useState(false);
	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
	const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const {
		data: customersData,
		error,
		mutate: mutateCustomers,
	} = useCustomers({
		page: 1,
		limit: 10,
	});

	const customers = customersData?.data || [];
	const meta = customersData?.meta;

	const handleDeleteClick = (customer: Customer) => {
		setDeletingCustomer(customer);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!deletingCustomer) return;

		setIsDeleting(true);
		try {
			await deleteCustomer(deletingCustomer._id);
			toast.success('Customer deleted successfully');
			mutateCustomers();
		} catch {
			toast.error('Failed to delete customer');
		} finally {
			setIsDeleting(false);
			setDeleteDialogOpen(false);
			setDeletingCustomer(null);
		}
	};

	const handleViewCustomer = (customer: Customer) => {
		setViewingCustomer(customer);
		setViewSheetOpen(true);
	};

	const handleEditCustomer = (customer: Customer) => {
		setEditingCustomer(customer);
		setEditSheetOpen(true);
	};

	const handleViewToEdit = () => {
		if (viewingCustomer) {
			setViewSheetOpen(false);
			setEditingCustomer(viewingCustomer);
			setEditSheetOpen(true);
		}
	};

	const handleViewToDelete = () => {
		setViewSheetOpen(false);
		mutateCustomers();
	};

	const handleCreateSuccess = () => {
		setCreateSheetOpen(false);
		mutateCustomers();
	};

	const handleEditSuccess = () => {
		setEditSheetOpen(false);
		setEditingCustomer(null);
		mutateCustomers();
	};

	const handleViewSuccess = () => {
		setViewSheetOpen(false);
		setViewingCustomer(null);
		mutateCustomers();
	};

	const columns = [
		{
			key: 'name',
			header: 'Name',
		},
		{
			key: 'email',
			header: 'Email',
		},
		{
			key: 'phone',
			header: 'Phone',
		},
		{
			key: 'company',
			header: 'Company',
			render: (value: unknown) => (
				<span className="max-w-xs truncate block">
					{value ? String(value) : '-'}
				</span>
			),
		},
		{
			key: 'city',
			header: 'City',
			render: (value: unknown) => (
				<span>
					{value ? String(value) : '-'}
				</span>
			),
		},
		{
			key: 'isActive',
			header: 'Status',
			render: (value: unknown) => (
				<Badge variant={value ? 'default' : 'secondary'}>
					{value ? 'Active' : 'Inactive'}
				</Badge>
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
			onClick: (customer: Customer) => {
				handleViewCustomer(customer);
			},
			variant: 'secondary' as const,
		},
		{
			label: 'Edit',
			onClick: (customer: Customer) => handleEditCustomer(customer),
			variant: 'outline' as const,
		},
		{
			label: 'Delete',
			onClick: (customer: Customer) => handleDeleteClick(customer),
			variant: 'destructive' as const,
		},
	];

	if (error) {
		return (
			<Card>
				<CardContent className="p-6">
					<p className="text-center text-red-500">Failed to load customers</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Customers ({meta?.total || 0})</h1>
				<div className="flex items-center gap-2">
					<Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
						<SheetTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Add Customer
							</Button>
						</SheetTrigger>
						<SheetContent>
							<div className="h-full">
								<CustomerForm onSuccess={handleCreateSuccess} />
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			{/* Customers Table */}
			<Card>
				<CardContent>
					{!customersData && !error ? (
						<div className="flex items-center justify-center py-8">
							<Spinner variant="pinwheel" />
						</div>
					) : customers.length === 0 ? (
						<div className="flex items-center justify-center py-8">
							<p>No customers found</p>
						</div>
					) : (
						<SimpleTable
							data={customers}
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
						{viewingCustomer && (
							<CustomerView
								customer={viewingCustomer}
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
						{editingCustomer && (
							<CustomerEditForm
								customer={editingCustomer}
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
				title="Delete Customer"
				description={`Are you sure you want to delete "${deletingCustomer?.name}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				isLoading={isDeleting}
			/>
		</div>
	);
}
