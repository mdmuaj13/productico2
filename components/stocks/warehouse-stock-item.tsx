'use client';

import { QuickAdjustPopover } from './quick-adjust-popover';
import { WarehouseStock } from '@/hooks/stocks';

interface WarehouseStockItemProps {
	warehouse: WarehouseStock;
	onStockUpdated: () => void;
}

export function WarehouseStockItem({
	warehouse,
	onStockUpdated,
}: WarehouseStockItemProps) {
	const isLowStock = warehouse.isLowStock;
	const isOutOfStock = warehouse.quantity === 0;

	return (
		<div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 group">
			<div className="flex items-center gap-2">
				<span className="text-sm text-muted-foreground">
					{warehouse.warehouseName}:
				</span>
				<span
					className={`text-sm font-medium ${
						isOutOfStock
							? 'text-red-600 dark:text-red-400'
							: isLowStock
							? 'text-amber-600 dark:text-amber-400'
							: ''
					}`}
				>
					{warehouse.quantity} units
				</span>
				{isOutOfStock && (
					<span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded">
						Out
					</span>
				)}
				{isLowStock && !isOutOfStock && (
					<span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded">
						Low
					</span>
				)}
			</div>
			<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
				<QuickAdjustPopover
					stockId={warehouse.stockId}
					currentQuantity={warehouse.quantity}
					operation="add"
					onSuccess={onStockUpdated}
				/>
				<QuickAdjustPopover
					stockId={warehouse.stockId}
					currentQuantity={warehouse.quantity}
					operation="deduct"
					onSuccess={onStockUpdated}
				/>
			</div>
		</div>
	);
}
