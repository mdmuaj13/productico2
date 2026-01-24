'use client';

import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Search, X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Product {
	_id: string;
	title: string;
	price: number;
	thumbnail?: string;
	categoryId?: {
		title: string;
	};
}

interface FeaturedProductsFormProps {
	initialData?: Record<string, unknown>;
	onUpdate?: (data: Record<string, unknown>) => void;
}

export function FeaturedProductsForm({ initialData, onUpdate }: FeaturedProductsFormProps) {
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<Product[]>([]);
	const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
	const [searching, setSearching] = useState(false);

	useEffect(() => {
		const loadInitialData = async () => {
			if (initialData) {
				const value = initialData as { productIds?: string[] };
				if (value.productIds && value.productIds.length > 0) {
					const productPromises = value.productIds.map((id: string) =>
						apiCall(`/api/products/${id}`).catch(() => null)
					);
					const products = await Promise.all(productPromises);
					const validProducts = products
						.filter((p) => p && p.status_code === 200)
						.map((p) => p.data);
					setSelectedProducts(validProducts);
				}
			}
			setFetching(false);
		};

		loadInitialData();
	}, [initialData]);

	useEffect(() => {
		const searchProducts = async () => {
			if (!searchQuery.trim()) {
				setSearchResults([]);
				return;
			}

			setSearching(true);
			try {
				const response = await apiCall(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=10`);
				if (response.status_code === 200 && response.data) {
					setSearchResults(response.data);
				}
			} catch (error) {
				console.error('Failed to search products:', error);
			} finally {
				setSearching(false);
			}
		};

		const debounce = setTimeout(searchProducts, 300);
		return () => clearTimeout(debounce);
	}, [searchQuery]);

	const addProduct = (product: Product) => {
		if (!selectedProducts.find((p) => p._id === product._id)) {
			setSelectedProducts([...selectedProducts, product]);
			setSearchQuery('');
			setSearchResults([]);
		}
	};

	const removeProduct = (productId: string) => {
		setSelectedProducts(selectedProducts.filter((p) => p._id !== productId));
	};

	const saveFeaturedProducts = async () => {
		setLoading(true);
		try {
			const payload = {
				type: 'featured',
				value: {
					productIds: selectedProducts.map((p) => p._id),
				},
			};

			const response = await apiCall('/api/storefront', {
				method: 'POST',
				body: JSON.stringify(payload),
			});

			if (response.status_code === 200 || response.status_code === 201) {
				toast.success('Featured products saved successfully');
			} else {
				toast.error(response.message || 'Failed to save featured products');
			}
		} catch (error) {
			console.error('Failed to save featured products:', error);
			toast.error('Failed to save featured products');
		} finally {
			setLoading(false);
		}
	};

	if (fetching) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Featured Products Carousel</CardTitle>
				<CardDescription>
					Select products to showcase on your storefront homepage
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Search Section */}
				<div className="space-y-2">
					<label className="text-sm font-medium">Search Products</label>
					<div className="relative">
						<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by product name..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>

					{/* Search Results */}
					{searchQuery && (
						<div className="border rounded-md max-h-60 overflow-y-auto">
							{searching ? (
								<div className="p-4 text-center text-sm text-muted-foreground">
									Searching...
								</div>
							) : searchResults.length > 0 ? (
								<div className="divide-y">
									{searchResults.map((product) => (
										<div
											key={product._id}
											className="p-3 hover:bg-muted/50 cursor-pointer flex items-center justify-between"
											onClick={() => addProduct(product)}
										>
											<div className="flex items-center gap-3">
												{product.thumbnail && (
													<img
														src={product.thumbnail}
														alt={product.title}
														className="w-10 h-10 object-cover rounded"
													/>
												)}
												<div>
													<p className="font-medium text-sm">{product.title}</p>
													<p className="text-xs text-muted-foreground">
														${product.price}
														{product.categoryId && ` • ${product.categoryId.title}`}
													</p>
												</div>
											</div>
											<Plus className="h-4 w-4 text-muted-foreground" />
										</div>
									))}
								</div>
							) : (
								<div className="p-4 text-center text-sm text-muted-foreground">
									No products found
								</div>
							)}
						</div>
					)}
				</div>

				{/* Selected Products */}
				<div className="space-y-2">
					<label className="text-sm font-medium">
						Selected Products ({selectedProducts.length})
					</label>
					{selectedProducts.length > 0 ? (
						<div className="border rounded-md divide-y">
							{selectedProducts.map((product, index) => (
								<div
									key={product._id}
									className="p-3 flex items-center justify-between hover:bg-muted/50"
								>
									<div className="flex items-center gap-3">
										<Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
											{index + 1}
										</Badge>
										{product.thumbnail && (
											<img
												src={product.thumbnail}
												alt={product.title}
												className="w-12 h-12 object-cover rounded"
											/>
										)}
										<div>
											<p className="font-medium">{product.title}</p>
											<p className="text-sm text-muted-foreground">${product.price}</p>
										</div>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => removeProduct(product._id)}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
					) : (
						<div className="border rounded-md p-8 text-center text-sm text-muted-foreground">
							No products selected. Search and add products to feature them on your storefront.
						</div>
					)}
				</div>

				<Button onClick={saveFeaturedProducts} disabled={loading}>
					{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Save Featured Products
				</Button>
			</CardContent>
		</Card>
	);
}
