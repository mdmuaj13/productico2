'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deleteCategory } from '@/hooks/categories';
import { ExternalLink } from 'lucide-react';
import { EntityView } from '@/components/ui/entity-view';
import { ViewField, formatDate } from '@/components/ui/view-field';

interface Category {
	_id: string;
	title: string;
	slug: string;
	description?: string;
	image?: string;
	serialNo: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface CategoryViewProps {
	category: Category;
	onEdit?: () => void;
	onDelete?: () => void;
	onSuccess?: () => void;
}

export function CategoryView({
	category,
	onEdit,
	onDelete,
	onSuccess,
}: CategoryViewProps) {
	return (
		<EntityView
			title="Category Details"
			entity={category}
			entityName="Category"
			getEntityDisplayName={(cat) => cat.title}
			onEdit={onEdit}
			onDelete={onDelete}
			onSuccess={onSuccess}
			deleteFunction={deleteCategory}>
			<ViewField
				label="Category Title"
				value={<p className="text-sm">{category.title}</p>}
			/>

			<ViewField
				label="Slug"
				value={<p className="text-sm font-mono">{category.slug}</p>}
			/>

			<ViewField
				label="Description"
				value={
					<p className="text-sm whitespace-pre-wrap">
						{category.description || 'No description provided'}
					</p>
				}
			/>

			{category.image && (
				<ViewField
					label="Image"
					value={
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<p className="text-sm font-mono break-all">{category.image}</p>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => window.open(category.image, '_blank')}>
									<ExternalLink className="h-3 w-3" />
								</Button>
							</div>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={category.image}
								alt={category.title}
								className="w-full max-w-xs h-32 object-cover rounded-md"
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.style.display = 'none';
								}}
							/>
						</div>
					}
				/>
			)}

			<div className="grid grid-cols-2 gap-4">
				<ViewField
					label="Serial Number"
					value={<p className="text-sm font-mono">{category.serialNo}</p>}
				/>

				<ViewField
					label="Status"
					value={
						<Badge variant={category.isActive ? 'default' : 'secondary'}>
							{category.isActive ? 'Active' : 'Inactive'}
						</Badge>
					}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<ViewField
					label="Created"
					value={<p className="text-sm">{formatDate(category.createdAt)}</p>}
				/>

				<ViewField
					label="Last Updated"
					value={<p className="text-sm">{formatDate(category.updatedAt)}</p>}
				/>
			</div>
		</EntityView>
	);
}