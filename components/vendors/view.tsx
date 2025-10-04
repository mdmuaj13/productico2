'use client';

import { deleteVendor } from '@/hooks/vendors';
import { EntityView } from '@/components/ui/entity-view';
import { ViewField, formatDate } from '@/components/ui/view-field';

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
	return (
		<EntityView
			title="Vendor Details"
			description="View vendor information and manage actions."
			entity={vendor}
			entityName="Vendor"
			getEntityDisplayName={(v) => v.name}
			onEdit={onEdit}
			onDelete={onDelete}
			onSuccess={onSuccess}
			deleteFunction={deleteVendor}>
			<ViewField
				label="Vendor Name"
				value={<p className="text-sm">{vendor.name}</p>}
			/>

			<ViewField
				label="Contact Number"
				value={<p className="text-sm">{vendor.contact_number}</p>}
			/>

			<ViewField
				label="Email"
				value={<p className="text-sm">{vendor.email || 'Not provided'}</p>}
			/>

			<ViewField
				label="Address"
				value={
					<p className="text-sm whitespace-pre-wrap">
						{vendor.address || 'Not provided'}
					</p>
				}
			/>

			<ViewField
				label="Remarks"
				value={
					<p className="text-sm whitespace-pre-wrap">
						{vendor.remarks || 'No remarks'}
					</p>
				}
			/>

			<div className="grid grid-cols-2 gap-4">
				<ViewField
					label="Created"
					value={<p className="text-sm">{formatDate(vendor.createdAt)}</p>}
				/>

				<ViewField
					label="Last Updated"
					value={<p className="text-sm">{formatDate(vendor.updatedAt)}</p>}
				/>
			</div>
		</EntityView>
	);
}
