'use client';

import { useState } from 'react';
import {
	useSubscriptions,
	deleteSubscription,
} from '@/hooks/subscriptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import SubscriptionForm from './subscription-form';
import { SimpleTable } from '@/components/simple-table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Spinner } from '../ui/shadcn-io/spinner';

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
	createdAt: string;
	updatedAt: string;
}

export default function SubscriptionsList() {
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [createSheetOpen, setCreateSheetOpen] = useState(false);
	const [editSheetOpen, setEditSheetOpen] = useState(false);
	const [selectedSubscription, setSelectedSubscription] =
		useState<ISubscription | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingSubscription, setDeletingSubscription] =
		useState<ISubscription | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const {
		data: subscriptionsData,
		error,
		mutate: mutateSubscriptions,
	} = useSubscriptions({
		page: 1,
		limit: 100,
		search,
	});

	const subscriptions = subscriptionsData?.data || [];
	const meta = subscriptionsData?.meta;

	const handleCreateSuccess = () => {
		setCreateSheetOpen(false);
		mutateSubscriptions();
		toast.success('Subscription plan created successfully');
	};

	const handleEditSuccess = () => {
		setEditSheetOpen(false);
		setSelectedSubscription(null);
		mutateSubscriptions();
		toast.success('Subscription plan updated successfully');
	};

	const handleEdit = (subscription: ISubscription) => {
		setSelectedSubscription(subscription);
		setEditSheetOpen(true);
	};

	const handleDeleteClick = (subscription: ISubscription) => {
		setDeletingSubscription(subscription);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!deletingSubscription) return;

		setIsDeleting(true);
		try {
			await deleteSubscription(deletingSubscription._id);
			toast.success('Subscription plan deleted successfully');
			mutateSubscriptions();
		} catch {
			toast.error('Failed to delete subscription plan');
		} finally {
			setIsDeleting(false);
			setDeleteDialogOpen(false);
			setDeletingSubscription(null);
		}
	};

	const handleSearch = () => {
		setSearch(searchTerm);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	const columns = [
		{
			key: 'displayName',
			header: 'Plan Name',
		},
		{
			key: 'name',
			header: 'Type',
			render: (value: string) => (
				<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
					{value}
				</span>
			),
		},
		{
			key: 'price',
			header: 'Price',
			render: (value: number, row: ISubscription) =>
				row.billingCycle === 'custom'
					? 'Custom'
					: `$${value.toFixed(2)}/${row.billingCycle}`,
		},
		{
			key: 'isActive',
			header: 'Status',
			render: (value: boolean) =>
				value ? (
					<span className="inline-flex items-center gap-1 text-green-600">
						<CheckCircle className="h-4 w-4" />
						Active
					</span>
				) : (
					<span className="inline-flex items-center gap-1 text-red-600">
						<XCircle className="h-4 w-4" />
						Inactive
					</span>
				),
		},
		{
			key: 'features',
			header: 'Features',
			render: (value: string[]) => (
				<span className="text-sm text-muted-foreground">
					{value?.length || 0} features
				</span>
			),
		},
	];

	const actions = [
		{
			label: 'Edit',
			icon: Edit,
			onClick: handleEdit,
		},
		{
			label: 'Delete',
			icon: Trash2,
			onClick: handleDeleteClick,
			variant: 'destructive' as const,
		},
	];

	if (error) {
		return (
			<Card>
				<CardContent className="py-8">
					<p className="text-center text-red-500">
						Error loading subscriptions
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
					<div className="flex-1 flex items-center gap-4">
						<div className="flex-1 flex items-center gap-2">
							<Input
								placeholder="Search subscription plans..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onKeyDown={handleKeyDown}
								className="max-w-sm"
							/>
							<Button variant="outline" size="icon" onClick={handleSearch}>
								<Search className="h-4 w-4" />
							</Button>
						</div>
						<Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
							<SheetTrigger asChild>
								<Button>
									<Plus className="h-4 w-4 mr-2" />
									New Plan
								</Button>
							</SheetTrigger>
							<SheetContent className="overflow-y-auto">
								<SubscriptionForm
									onSuccess={handleCreateSuccess}
									onCancel={() => setCreateSheetOpen(false)}
								/>
							</SheetContent>
						</Sheet>
					</div>
				</CardHeader>
				<CardContent>
					{!subscriptionsData ? (
						<div className="flex justify-center py-8">
							<Spinner />
						</div>
					) : (
						<>
							<SimpleTable
								columns={columns}
								data={subscriptions}
								actions={actions}
							/>
							{subscriptions.length === 0 && (
								<p className="text-center text-muted-foreground py-8">
									No subscription plans found
								</p>
							)}
							{meta && (
								<div className="mt-4 text-sm text-muted-foreground">
									Showing {subscriptions.length} of {meta.total} plans
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>

			<Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
				<SheetContent className="overflow-y-auto">
					{selectedSubscription && (
						<SubscriptionForm
							subscription={selectedSubscription}
							onSuccess={handleEditSuccess}
							onCancel={() => {
								setEditSheetOpen(false);
								setSelectedSubscription(null);
							}}
						/>
					)}
				</SheetContent>
			</Sheet>

			<ConfirmationDialog
				isOpen={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				onConfirm={handleDeleteConfirm}
				title="Delete Subscription Plan"
				description={`Are you sure you want to delete "${deletingSubscription?.displayName}"? This action cannot be undone.`}
				isLoading={isDeleting}
			/>
		</>
	);
}
