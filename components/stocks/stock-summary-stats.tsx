'use client';

import { Package, AlertTriangle, XCircle } from 'lucide-react';

interface StockSummaryStatsProps {
	totalProducts: number;
	lowStockCount: number;
	outOfStockCount: number;
}

export function StockSummaryStats({
	totalProducts,
	lowStockCount,
	outOfStockCount,
}: StockSummaryStatsProps) {
	return (
		<div className="grid grid-cols-3 gap-4">
			<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
				<div className="p-2 rounded-full bg-primary/10">
					<Package className="h-5 w-5 text-primary" />
				</div>
				<div>
					<p className="text-2xl font-bold">{totalProducts}</p>
					<p className="text-sm text-muted-foreground">Products</p>
				</div>
			</div>
			<div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
				<div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
					<AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
				</div>
				<div>
					<p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
						{lowStockCount}
					</p>
					<p className="text-sm text-amber-600/80 dark:text-amber-400/80">Low Stock</p>
				</div>
			</div>
			<div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
				<div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
					<XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
				</div>
				<div>
					<p className="text-2xl font-bold text-red-600 dark:text-red-400">
						{outOfStockCount}
					</p>
					<p className="text-sm text-red-600/80 dark:text-red-400/80">Out of Stock</p>
				</div>
			</div>
		</div>
	);
}
