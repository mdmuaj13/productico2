'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Plus, Search } from 'lucide-react';
import { useStockSummary, StockSummaryResponse } from '@/hooks/stocks';
import { StockForm } from './stock-form';
import { StockSummaryStats } from './stock-summary-stats';
import { ProductStockCard } from './product-stock-card';
import { Spinner } from '../ui/shadcn-io/spinner';

export function StocksList() {
	const [createSheetOpen, setCreateSheetOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	const { data: summaryData, error, mutate: mutateSummary } = useStockSummary();

	const stockData = summaryData?.data as StockSummaryResponse | undefined;
	const products = stockData?.products || [];
	const stats = stockData?.stats || {
		totalProducts: 0,
		lowStockCount: 0,
		outOfStockCount: 0,
	};

	// Filter products by search query
	const filteredProducts = useMemo(() => {
		if (!searchQuery.trim()) {
			return products;
		}
		const query = searchQuery.toLowerCase();
		return products.filter((p) =>
			p.product.title.toLowerCase().includes(query)
		);
	}, [products, searchQuery]);

	const handleCreateSuccess = () => {
		setCreateSheetOpen(false);
		mutateSummary();
	};

	const handleStockUpdated = () => {
		mutateSummary();
	};

	if (error) {
		return (
			<Card>
				<CardContent className="p-6">
					<p className="text-center text-red-500">Failed to load stock data</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Stock Management</h1>
				<Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
					<SheetTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add Stock
						</Button>
					</SheetTrigger>
					<SheetContent>
						<div className="h-full">
							<StockForm onSuccess={handleCreateSuccess} />
						</div>
					</SheetContent>
				</Sheet>
			</div>

			{/* Stats Summary */}
			<StockSummaryStats
				totalProducts={stats.totalProducts}
				lowStockCount={stats.lowStockCount}
				outOfStockCount={stats.outOfStockCount}
			/>

			{/* Search */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search products..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-10"
				/>
			</div>

			{/* Product Stock List */}
			{!summaryData && !error ? (
				<Card>
					<CardContent className="py-12">
						<div className="flex items-center justify-center">
							<Spinner variant="pinwheel" />
						</div>
					</CardContent>
				</Card>
			) : filteredProducts.length === 0 ? (
				<Card>
					<CardContent className="py-12">
						<p className="text-center text-muted-foreground">
							{searchQuery
								? 'No products match your search.'
								: 'No stock entries found. Add your first stock entry to get started.'}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{filteredProducts.map((productStock) => (
						<ProductStockCard
							key={productStock.productId}
							productStock={productStock}
							onStockUpdated={handleStockUpdated}
						/>
					))}
				</div>
			)}
		</div>
	);
}
