'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { quickAdjustStock } from '@/hooks/stocks';

interface QuickAdjustPopoverProps {
	stockId: string;
	currentQuantity: number;
	operation: 'add' | 'deduct';
	onSuccess: () => void;
}

export function QuickAdjustPopover({
	stockId,
	currentQuantity,
	operation,
	onSuccess,
}: QuickAdjustPopoverProps) {
	const [open, setOpen] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (quantity <= 0) {
			toast.error('Quantity must be greater than 0');
			return;
		}

		if (operation === 'deduct' && quantity > currentQuantity) {
			toast.error(`Cannot deduct more than current stock (${currentQuantity})`);
			return;
		}

		setIsLoading(true);
		try {
			await quickAdjustStock(stockId, {
				operation,
				quantity,
			});
			toast.success(
				`Stock ${operation === 'add' ? 'increased' : 'decreased'} by ${quantity}`
			);
			setOpen(false);
			setQuantity(1);
			onSuccess();
		} catch {
			toast.error('Failed to adjust stock');
		} finally {
			setIsLoading(false);
		}
	};

	const newQuantity =
		operation === 'add'
			? currentQuantity + quantity
			: Math.max(0, currentQuantity - quantity);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={`h-7 w-7 ${
						operation === 'add'
							? 'hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/30 dark:hover:text-green-400'
							: 'hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-400'
					}`}
				>
					{operation === 'add' ? (
						<Plus className="h-4 w-4" />
					) : (
						<Minus className="h-4 w-4" />
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-64" align="end">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label>
							{operation === 'add' ? 'Add Stock' : 'Deduct Stock'}
						</Label>
						<Input
							type="number"
							min={1}
							max={operation === 'deduct' ? currentQuantity : undefined}
							value={quantity}
							onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
							placeholder="Quantity"
						/>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Current: {currentQuantity}</span>
						<span className="font-medium">
							New: {newQuantity}
						</span>
					</div>
					<Button
						type="submit"
						className="w-full"
						disabled={isLoading || quantity <= 0}
					>
						{isLoading ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Updating...
							</>
						) : (
							<>
								{operation === 'add' ? (
									<Plus className="h-4 w-4 mr-2" />
								) : (
									<Minus className="h-4 w-4 mr-2" />
								)}
								{operation === 'add' ? 'Add' : 'Deduct'} {quantity}
							</>
						)}
					</Button>
				</form>
			</PopoverContent>
		</Popover>
	);
}
