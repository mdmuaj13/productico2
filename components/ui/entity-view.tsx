'use client';

import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface EntityViewProps<T> {
	title: string;
	description: string;
	entity: T;
	entityName: string;
	getEntityDisplayName: (entity: T) => string;
	onEdit?: () => void;
	onDelete?: () => void;
	onSuccess?: () => void;
	deleteFunction: (id: string) => Promise<void>;
	children: ReactNode;
}

export function EntityView<T extends { _id: string }>({
	title,
	description,
	entity,
	entityName,
	getEntityDisplayName,
	onEdit,
	onDelete,
	onSuccess,
	deleteFunction,
	children,
}: EntityViewProps<T>) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		setIsDeleting(true);
		try {
			await deleteFunction(entity._id);
			toast.success(`${entityName} deleted successfully`);
			onSuccess?.();
			onDelete?.();
		} catch (error) {
			console.error(`Error deleting ${entityName.toLowerCase()}:`, error);
			toast.error(`Failed to delete ${entityName.toLowerCase()}`);
		} finally {
			setIsDeleting(false);
			setDeleteDialogOpen(false);
		}
	};

	return (
		<>
			<div className="flex flex-col h-full space-y-6 px-4 pt-8">
				<SheetHeader className="px-0">
					<SheetTitle>{title}</SheetTitle>
					<SheetDescription>{description}</SheetDescription>
				</SheetHeader>

				<div className="flex-1 space-y-6 py-4 overflow-y-auto">
					<div className="grid grid-cols-1 gap-4">{children}</div>
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

			<ConfirmationDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={handleDeleteConfirm}
				title={`Delete ${entityName}`}
				description={`Are you sure you want to delete "${getEntityDisplayName(entity)}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="destructive"
				isLoading={isDeleting}
			/>
		</>
	);
}
