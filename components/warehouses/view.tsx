'use client';

import { deleteWarehouse } from '@/hooks/warehouses';
import { EntityView } from '@/components/ui/entity-view';
import { ViewField, formatDate } from '@/components/ui/view-field';

interface Warehouse {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	address: string;
	createdAt: string;
	updatedAt: string;
}

interface WarehouseViewProps {
	warehouse: Warehouse;
	onEdit?: () => void;
	onDelete?: () => void;
	onSuccess?: () => void;
}

export function WarehouseView({
	warehouse,
	onEdit,
	onDelete,
	onSuccess,
}: WarehouseViewProps) {
	return (
		<EntityView
			title="Warehouse Details"
			entity={warehouse}
			entityName="Warehouse"
			getEntityDisplayName={(w) => w.title}
			onEdit={onEdit}
			onDelete={onDelete}
			onSuccess={onSuccess}
			deleteFunction={deleteWarehouse}>
			<ViewField
				label="Warehouse Name"
				value={<p className="text-sm">{warehouse.title}</p>}
			/>

			<ViewField
				label="Slug"
				value={<p className="text-sm font-mono">{warehouse.slug}</p>}
			/>

			<ViewField
				label="Description"
				value={
					<p className="text-sm whitespace-pre-wrap">
						{warehouse.description || 'No description provided'}
					</p>
				}
			/>

			<ViewField
				label="Address"
				value={
					<p className="text-sm whitespace-pre-wrap">{warehouse.address}</p>
				}
			/>

			<div className="grid grid-cols-2 gap-4">
				<ViewField
					label="Created"
					value={<p className="text-sm">{formatDate(warehouse.createdAt)}</p>}
				/>

				<ViewField
					label="Last Updated"
					value={<p className="text-sm">{formatDate(warehouse.updatedAt)}</p>}
				/>
			</div>
		</EntityView>
	);
}
