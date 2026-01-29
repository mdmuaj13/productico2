'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Package, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VariantStockRow } from './variant-stock-row';
import { ProductStockSummary } from '@/hooks/stocks';

interface ProductStockCardProps {
	productStock: ProductStockSummary;
	onStockUpdated: () => void;
}

export function ProductStockCard({ productStock, onStockUpdated }: ProductStockCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const { product, totalStock, variantCount, warehouseCount, hasLowStock, hasOutOfStock, variants } = productStock;

	const getStatusIcon = () => {
		if (hasOutOfStock) {
			return <XCircle className="h-4 w-4 text-red-500" />;
		}
		if (hasLowStock) {
			return <AlertTriangle className="h-4 w-4 text-amber-500" />;
		}
		return <CheckCircle className="h-4 w-4 text-green-500" />;
	};

	const getStatusClass = () => {
		if (hasOutOfStock) {
			return 'border-l-red-500';
		}
		if (hasLowStock) {
			return 'border-l-amber-500';
		}
		return 'border-l-green-500';
	};

	return (
		<Card className={`overflow-hidden border-l-4 ${getStatusClass()}`}>
			<Button
				variant="ghost"
				className="w-full justify-start p-4 h-auto hover:bg-muted/50"
				onClick={() => setIsExpanded(!isExpanded)}
			>
				<div className="flex items-center gap-4 w-full">
					{/* Expand/Collapse Icon */}
					<div className="flex-shrink-0">
						{isExpanded ? (
							<ChevronDown className="h-5 w-5 text-muted-foreground" />
						) : (
							<ChevronRight className="h-5 w-5 text-muted-foreground" />
						)}
					</div>

					{/* Product Thumbnail */}
					<div className="flex-shrink-0 w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
						{product.thumbnail ? (
							<img
								src={product.thumbnail}
								alt={product.title}
								className="w-full h-full object-cover"
							/>
						) : (
							<Package className="h-5 w-5 text-muted-foreground" />
						)}
					</div>

					{/* Product Info */}
					<div className="flex-1 text-left">
						<h3 className="font-medium text-base">{product.title}</h3>
						<div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
							<span>{variantCount} variant{variantCount !== 1 ? 's' : ''}</span>
							<span>•</span>
							<span>{warehouseCount} warehouse{warehouseCount !== 1 ? 's' : ''}</span>
						</div>
					</div>

					{/* Total Stock */}
					<div className="flex items-center gap-2">
						<div className="text-right">
							<p className="text-lg font-bold">{totalStock}</p>
							<p className="text-xs text-muted-foreground">total units</p>
						</div>
						{getStatusIcon()}
					</div>
				</div>
			</Button>

			{/* Expanded Content */}
			{isExpanded && (
				<div className="p-4 pt-0 space-y-3">
					<div className="border-t pt-4">
						{variants.map((variant, index) => (
							<div key={variant.variantName || 'base'} className={index > 0 ? 'mt-3' : ''}>
								<VariantStockRow variant={variant} onStockUpdated={onStockUpdated} />
							</div>
						))}
					</div>
				</div>
			)}
		</Card>
	);
}
