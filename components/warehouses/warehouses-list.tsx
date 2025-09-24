'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { useWarehouses } from '@/hooks/warehouses';
import { WarehouseForm } from './create';
import { WarehouseEditForm } from './edit-form';
import { WarehouseView } from './view';
import { SimpleTable } from '@/components/simple-table';
import { Spinner } from '../ui/shadcn-io/spinner';

interface Warehouse {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	address: string;
	createdAt: string;
	updatedAt: string;
}

export function WarehousesList() {
	const [createSheetOpen, setCreateSheetOpen] = useState(false);
	const [viewSheetOpen, setViewSheetOpen] = useState(false);
	const [editSheetOpen, setEditSheetOpen] = useState(false);
	const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
		null
	);
	const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
		null
	);

	const {
		data: warehousesData,
		error,
		mutate: mutateWarehouses,
	} = useWarehouses({
		page: 1,
		limit: 10,
	});

	const warehouses = warehousesData?.data || [];
	const meta = warehousesData?.meta;

	const handleViewWarehouse = (warehouse: Warehouse) => {
		setSelectedWarehouse(warehouse);
		setViewSheetOpen(true);
	};

	const handleEditWarehouse = (warehouse: Warehouse) => {
		setEditingWarehouse(warehouse);
		setEditSheetOpen(true);
	};

	const handleEditClickFromView = () => {
		if (selectedWarehouse) {
			setEditingWarehouse(selectedWarehouse);
			setViewSheetOpen(false);
			setEditSheetOpen(true);
		}
	};

	const handleDeleteSuccess = () => {
		setViewSheetOpen(false);
		setSelectedWarehouse(null);
		mutateWarehouses();
	};

	const handleCreateSuccess = () => {
		setCreateSheetOpen(false);
		mutateWarehouses();
	};

	const handleEditSuccess = () => {
		setEditSheetOpen(false);
		setEditingWarehouse(null);
		mutateWarehouses();
	};

	const columns = [
		{
			key: 'title',
			header: 'Name',
		},
		{
			key: 'address',
			header: 'Address',
			render: (value: unknown) => (
				<span className="max-w-xs truncate block">{String(value)}</span>
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
			onClick: (warehouse: Warehouse) => handleViewWarehouse(warehouse),
			variant: 'outline' as const,
		},
		{
			label: 'Edit',
			onClick: (warehouse: Warehouse) => handleEditWarehouse(warehouse),
			variant: 'outline' as const,
		},
		{
			label: 'Delete',
			onClick: (warehouse: Warehouse) => handleViewWarehouse(warehouse),
			variant: 'destructive' as const,
		},
	];

	if (error) {
		return (
			<Card>
				<CardContent className="p-6">
					<p className="text-center text-red-500">Failed to load warehouses</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Warehouses ({meta?.total || 0})</h1>
				<div className="flex items-center gap-2">
					<Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
						<SheetTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Add Warehouse
							</Button>
						</SheetTrigger>
						<SheetContent>
							<div className="h-full">
								<WarehouseForm onSuccess={handleCreateSuccess} />
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			{/* Warehouses Table */}
			<Card>
				{/* <CardHeader>
					<div className="flex gap-4 items-center">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search warehouses..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="pl-8"
								/>
							</div>
						</div>
					</div>
				</CardHeader> */}
				<CardContent>
					{!warehousesData && !error ? (
						<div className="flex items-center justify-center py-8">
							<Spinner variant="pinwheel" />
						</div>
					) : warehouses.length === 0 ? (
						<div className="flex items-center justify-center py-8">
							<p>No warehouses found</p>
						</div>
					) : (
						<SimpleTable
							data={warehouses}
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
						{selectedWarehouse && (
							<WarehouseView
								warehouse={selectedWarehouse}
								onEdit={handleEditClickFromView}
								onSuccess={handleDeleteSuccess}
							/>
						)}
					</div>
				</SheetContent>
			</Sheet>

			{/* Edit Sheet */}
			<Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
				<SheetContent>
					<div className="h-full">
						{editingWarehouse && (
							<WarehouseEditForm
								warehouse={editingWarehouse}
								onSuccess={handleEditSuccess}
							/>
						)}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
