'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	title?: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	variant?: 'destructive' | 'default';
	isLoading?: boolean;
}

export function ConfirmationDialog({
	open,
	onOpenChange,
	onConfirm,
	title = 'Are you sure?',
	description = 'This action cannot be undone.',
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	variant = 'destructive',
	isLoading = false,
}: ConfirmationDialogProps) {
	const handleConfirm = () => {
		onConfirm();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
					>
						{cancelText}
					</Button>
					<Button
						type="button"
						variant={variant}
						onClick={handleConfirm}
						disabled={isLoading}
					>
						{isLoading ? 'Loading...' : confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}