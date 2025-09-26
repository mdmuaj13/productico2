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
import { deleteCategory } from '@/hooks/categories';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Edit, Trash2, ExternalLink } from 'lucide-react';

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
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		setIsDeleting(true);
		try {
			console.log('Deleting category:', category._id);
			await deleteCategory(category._id);
			toast.success('Category deleted successfully');
			onSuccess?.();
			onDelete?.();
		} catch (error) {
			console.error('Error deleting category:', error);
			toast.error('Failed to delete category');
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
					<SheetTitle>Category Details</SheetTitle>
					<SheetDescription>
						View category information and manage actions.
					</SheetDescription>
				</SheetHeader>

				<div className="flex-1 space-y-6 py-4">
					<div className="grid grid-cols-1 gap-4">
						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground">
								Category Title
							</Label>
							<div className="p-3 bg-muted/50 rounded-md">
								<p className="text-sm">{category.title}</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground">
								Slug
							</Label>
							<div className="p-3 bg-muted/50 rounded-md">
								<p className="text-sm font-mono">{category.slug}</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-sm font-medium text-muted-foreground">
								Description
							</Label>
							<div className="p-3 bg-muted/50 rounded-md">
								<p className="text-sm whitespace-pre-wrap">
									{category.description || 'No description provided'}
								</p>
							</div>
						</div>

						{category.image && (
							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Image
								</Label>
								<div className="p-3 bg-muted/50 rounded-md space-y-2">
									<div className="flex items-center gap-2">
										<p className="text-sm font-mono break-all">{category.image}</p>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => window.open(category.image, '_blank')}
										>
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
							</div>
						)}

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Serial Number
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<p className="text-sm font-mono">{category.serialNo}</p>
								</div>
							</div>

							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Status
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<Badge variant={category.isActive ? 'default' : 'secondary'}>
										{category.isActive ? 'Active' : 'Inactive'}
									</Badge>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Created
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<p className="text-sm">{formatDate(category.createdAt)}</p>
								</div>
							</div>

							<div className="space-y-2">
								<Label className="text-sm font-medium text-muted-foreground">
									Last Updated
								</Label>
								<div className="p-3 bg-muted/50 rounded-md">
									<p className="text-sm">{formatDate(category.updatedAt)}</p>
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
				title="Delete Category"
				description={`Are you sure you want to delete "${category.title}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				isLoading={isDeleting}
			/>
		</>
	);
}