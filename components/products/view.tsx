'use client';

import { Badge } from '@/components/ui/badge';
import { deleteProduct } from '@/hooks/products';
import { EntityView } from '@/components/ui/entity-view';
import { ViewField, formatDate } from '@/components/ui/view-field';

interface Variant {
	name: string;
	price: number;
	salePrice?: number;
}

interface Product {
	_id: string;
	title: string;
	slug: string;
	thumbnail?: string;
	categoryId: {
		_id: string;
		title: string;
		slug: string;
	};
	price: number;
	salePrice?: number;
	unit: string;
	tags: string[];
	variants: Variant[];
	createdAt: string;
	updatedAt: string;
}

interface ProductViewProps {
	product: Product;
	onEdit?: () => void;
	onDelete?: () => void;
	onSuccess?: () => void;
}

export function ProductView({
	product,
	onEdit,
	onDelete,
	onSuccess,
}: ProductViewProps) {
	return (
		<EntityView
			title="Product Details"
			description="View product information and manage actions."
			entity={product}
			entityName="Product"
			getEntityDisplayName={(prod) => prod.title}
			onEdit={onEdit}
			onDelete={onDelete}
			onSuccess={onSuccess}
			deleteFunction={deleteProduct}>
			<ViewField
				label="Product Name"
				value={<p className="text-sm">{product.title}</p>}
			/>

			<ViewField
				label="Slug"
				value={<p className="text-sm font-mono">{product.slug}</p>}
			/>

			<ViewField
				label="Category"
				value={<p className="text-sm">{product.categoryId.title}</p>}
			/>

			<div className="grid grid-cols-2 gap-4">
				<ViewField
					label="Price"
					value={<p className="text-sm font-semibold">${product.price}</p>}
				/>

				<ViewField
					label="Sale Price"
					value={
						<p className="text-sm">
							{product.salePrice ? `$${product.salePrice}` : 'Not set'}
						</p>
					}
				/>
			</div>

			<ViewField label="Unit" value={<p className="text-sm">{product.unit}</p>} />

			{product.thumbnail && (
				<ViewField
					label="Thumbnail"
					value={<p className="text-sm break-all">{product.thumbnail}</p>}
				/>
			)}

			{product.tags && product.tags.length > 0 && (
				<ViewField
					label="Tags"
					value={
						<div className="flex flex-wrap gap-2">
							{product.tags.map((tag, index) => (
								<Badge key={index} variant="secondary">
									{tag}
								</Badge>
							))}
						</div>
					}
				/>
			)}

			{product.variants && product.variants.length > 0 && (
				<ViewField
					label={`Variants (${product.variants.length})`}
					value={
						<div className="space-y-3">
							{product.variants.map((variant, index) => (
								<div key={index} className="space-y-1">
									<p className="text-sm font-medium">{variant.name}</p>
									<p className="text-sm text-muted-foreground">
										${variant.price}
										{variant.salePrice && ` • Sale: $${variant.salePrice}`}
									</p>
									{index < product.variants.length - 1 && (
										<div className="pt-2 border-b border-border/50" />
									)}
								</div>
							))}
						</div>
					}
				/>
			)}

			<div className="grid grid-cols-2 gap-4">
				<ViewField
					label="Created"
					value={<p className="text-sm">{formatDate(product.createdAt)}</p>}
				/>

				<ViewField
					label="Last Updated"
					value={<p className="text-sm">{formatDate(product.updatedAt)}</p>}
				/>
			</div>
		</EntityView>
	);
}
