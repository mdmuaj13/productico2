'use client';

import { WarehouseStockItem } from './warehouse-stock-item';
import { VariantStock } from '@/hooks/stocks';

interface VariantStockRowProps {
	variant: VariantStock;
	onStockUpdated: () => void;
}

export function VariantStockRow({ variant, onStockUpdated }: VariantStockRowProps) {
	const hasLowStock = variant.warehouses.some((w) => w.isLowStock);
	const hasOutOfStock = variant.warehouses.some((w) => w.quantity === 0);

	return (
		<div className="border rounded-lg overflow-hidden">
			<div className="flex items-center justify-between px-4 py-2 bg-muted/30">
				<div className="flex items-center gap-2">
					<span className="font-medium text-sm">
						{variant.variantName || 'Base Product'}
					</span>
					{hasOutOfStock && (
						<span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded">
							Out of Stock
						</span>
					)}
					{hasLowStock && !hasOutOfStock && (
						<span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded">
							Low Stock
						</span>
					)}
				</div>
				<span className="text-sm text-muted-foreground">
					Subtotal: <span className="font-medium">{variant.totalStock}</span>
				</span>
			</div>
			<div className="divide-y">
				{variant.warehouses.map((warehouse) => (
					<WarehouseStockItem
						key={warehouse.stockId}
						warehouse={warehouse}
						onStockUpdated={onStockUpdated}
					/>
				))}
			</div>
		</div>
	);
}
