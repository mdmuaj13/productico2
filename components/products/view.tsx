'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet';
import { deleteProduct } from '@/hooks/products';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Edit, Trash2 } from 'lucide-react';

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
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		setIsDeleting(true);
		try {
			await deleteProduct(product._id);
			toast.success('Product deleted successfully');
			onSuccess?.();
			onDelete?.();
		} catch {
			toast.error('Failed to delete product');
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
					<SheetTitle>Product Details</SheetTitle>
					<SheetDescription>
						View product information and manage actions.
					</SheetDescription>
				</SheetHeader>

				<div className="flex-1 space-y-6 py-4">
					<div className="grid grid-cols-1 gap-4">
						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground">
								Product Name
							</Label>
							<div className="p-3 bg-muted/50 rounded-md">
								<p className="text-sm">{product.title}</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground">
								Slug
							</Label>
							<div className="p-3 bg-muted/50 rounded-md">
								<p className="text-sm font-mono">{product.slug}</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground">
								Category
							</Label>
							<div className="p-3 bg-muted/50 rounded-md">
								<p className="text-sm">{product.categoryId.title}</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Price
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<p className="text-sm font-semibold">${product.price}</p>
								</div>
							</div>

							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Sale Price
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<p className="text-sm">
										{product.salePrice ? `$${product.salePrice}` : 'Not set'}
									</p>
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground">
								Unit
							</Label>
							<div className="p-3 bg-muted/50 rounded-md">
								<p className="text-sm">{product.unit}</p>
							</div>
						</div>

						{product.thumbnail && (
							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Thumbnail
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<p className="text-sm break-all">{product.thumbnail}</p>
								</div>
							</div>
						)}

						{product.tags && product.tags.length > 0 && (
							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Tags
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<div className="flex flex-wrap gap-2">
										{product.tags.map((tag, index) => (
											<Badge key={index} variant="secondary">
												{tag}
											</Badge>
										))}
									</div>
								</div>
							</div>
						)}

						{product.variants && product.variants.length > 0 && (
							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Variants ({product.variants.length})
								</Label>
								<div className="p-3 bg-muted/50 rounded-md space-y-3">
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
							</div>
						)}

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Created
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<p className="text-sm">{formatDate(product.createdAt)}</p>
								</div>
							</div>

							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Last Updated
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<p className="text-sm">{formatDate(product.updatedAt)}</p>
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
				title="Delete Product"
				description={`Are you sure you want to delete "${product.title}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				isLoading={isDeleting}
			/>
		</>
	);
}
