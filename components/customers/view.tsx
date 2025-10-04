'use client';

import { Badge } from '@/components/ui/badge';
import { deleteCustomer } from '@/hooks/customers';
import { Mail, Phone, Building2, MapPin } from 'lucide-react';
import { EntityView } from '@/components/ui/entity-view';
import { ViewField, formatDate } from '@/components/ui/view-field';

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
	return (
		<EntityView
			title="Customer Details"
			description="View customer information and manage actions."
			entity={customer}
			entityName="Customer"
			getEntityDisplayName={(cust) => cust.name}
			onEdit={onEdit}
			onDelete={onDelete}
			onSuccess={onSuccess}
			deleteFunction={deleteCustomer}>
			<ViewField
				label="Customer Name"
				value={<p className="text-sm font-medium">{customer.name}</p>}
			/>

			<ViewField
				label="Email"
				icon={<Mail className="h-4 w-4" />}
				value={
					<a
						href={`mailto:${customer.email}`}
						className="text-sm text-blue-600 hover:underline">
						{customer.email}
					</a>
				}
			/>

			<ViewField
				label="Phone"
				icon={<Phone className="h-4 w-4" />}
				value={
					<a
						href={`tel:${customer.phone}`}
						className="text-sm text-blue-600 hover:underline">
						{customer.phone}
					</a>
				}
			/>

			{customer.company && (
				<ViewField
					label="Company"
					icon={<Building2 className="h-4 w-4" />}
					value={<p className="text-sm">{customer.company}</p>}
				/>
			)}

			{customer.address && (
				<ViewField
					label="Address"
					icon={<MapPin className="h-4 w-4" />}
					value={
						<p className="text-sm whitespace-pre-wrap">{customer.address}</p>
					}
				/>
			)}

			{(customer.city || customer.country || customer.postalCode) && (
				<ViewField
					label="Location"
					value={
						<p className="text-sm">
							{[customer.city, customer.country, customer.postalCode]
								.filter(Boolean)
								.join(', ')}
						</p>
					}
				/>
			)}

			<ViewField
				label="Status"
				value={
					<Badge variant={customer.isActive ? 'default' : 'secondary'}>
						{customer.isActive ? 'Active' : 'Inactive'}
					</Badge>
				}
			/>

			<div className="grid grid-cols-2 gap-4">
				<ViewField
					label="Created"
					value={<p className="text-sm">{formatDate(customer.createdAt)}</p>}
				/>

				<ViewField
					label="Last Updated"
					value={<p className="text-sm">{formatDate(customer.updatedAt)}</p>}
				/>
			</div>
		</EntityView>
	);
}
