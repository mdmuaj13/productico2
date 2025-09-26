'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { useProducts, deleteProduct } from '@/hooks/products';
import { ProductForm } from './product-form';
import { createProduct, updateProduct } from '@/hooks/products';
import { CreateProductData, UpdateProductData } from '@/lib/validations/product';
import { toast } from 'sonner';
import { useApi } from '@/lib/api';
import { DataTable, Column } from '@/components/dashboard/table';

interface Category {
	_id: string;
	name: string;
	slug: string;
}

interface Product {
	_id: string;
	title: string;
	slug: string;
	thumbnail?: string;
	categoryId: {
		_id: string;
		title: string;
		slug: string;
	};
	price: number;
	salePrice?: number;
	unit: string;
	tags: string[];
	variants: Record<string, unknown>[];
}

export function ProductsList() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('all');
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(false);

	const {
		data: productsData,
		error,
		mutate: mutateProducts,
	} = useProducts({
		page,
		limit: 10,
		search,
		categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
	});

	const { data: categoriesData } = useApi(
		'/api/categories'
	);
	const categories = categoriesData?.data || [];

	const products = productsData?.data || [];
	const meta = productsData?.meta;

	const handleCreateProduct = async (data: CreateProductData | UpdateProductData) => {
		setLoading(true);
		try {
			await createProduct(data as CreateProductData);
			toast.success('Product created successfully');
			setCreateDialogOpen(false);
			mutateProducts();
		} catch (error) {
			toast.error('Failed to create product');
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateProduct = async (data: UpdateProductData) => {
		if (!editingProduct) return;

		setLoading(true);
		try {
			await updateProduct(editingProduct._id, data);
			toast.success('Product updated successfully');
			setEditDialogOpen(false);
			setEditingProduct(null);
			mutateProducts();
		} catch (error) {
			toast.error('Failed to update product');
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteProduct = async (id: string) => {
		if (!confirm('Are you sure you want to delete this product?')) return;

		try {
			await deleteProduct(id);
			toast.success('Product deleted successfully');
			mutateProducts();
		} catch (error) {
			toast.error('Failed to delete product');
		}
	};

	const handleEditProduct = (product: Product) => {
		setEditingProduct(product);
		setEditDialogOpen(true);
	};

	const columns: Column<Product>[] = [
		{
			id: 'title',
			header: 'Product',
			accessor: (product) => product.title,
		},
		{
			id: 'category',
			header: 'Category',
			accessor: (product) => product.categoryId.title,
		},
		{
			id: 'price',
			header: 'Price',
			accessor: (product) => `$${product.price}`,
		},
		{
			id: 'unit',
			header: 'Unit',
			accessor: (product) => product.unit,
		},
		{
			id: 'actions',
			header: 'Actions',
			className: 'text-right',
			cell: (product) => (
				<div className="flex gap-2 justify-end">
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleEditProduct(product)}>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => handleDeleteProduct(product._id)}>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	];

	if (error) {
		return (
			<Card>
				<CardContent className="p-6">
					<p className="text-center text-red-500">Failed to load products</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Products ({meta?.total || 0})</h1>
				<div className="flex items-center gap-2">
					<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Add Product
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Create Product</DialogTitle>
							</DialogHeader>
							<ProductForm onSubmit={handleCreateProduct} loading={loading} />
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Products Table */}
			<Card>
				<CardHeader>
					<div className="flex gap-4 items-center">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search products..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="pl-8"
								/>
							</div>
						</div>
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className="w-48">
								<SelectValue placeholder="Filter by category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Categories</SelectItem>
								{categories?.length > 0 &&
									categories?.map((category: Category) => (
										<SelectItem key={category._id} value={category._id}>
											{category.name}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					<DataTable
						data={products}
						columns={columns}
						loading={!productsData && !error}
						emptyMessage="No products found"
						pagination={
							meta
								? {
										page: meta.page,
										limit: meta.limit,
										total: meta.total,
										totalPages: meta.totalPages,
										onPageChange: setPage,
								  }
								: undefined
						}
					/>
				</CardContent>
			</Card>

			{/* Edit Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Edit Product</DialogTitle>
					</DialogHeader>
					{editingProduct && (
						<ProductForm
							initialData={{
								...editingProduct,
								categoryId: typeof editingProduct.categoryId === 'object'
									? editingProduct.categoryId._id
									: editingProduct.categoryId,
								variants: editingProduct.variants as { name: string; price: number; salePrice?: number }[]
							}}
							onSubmit={handleUpdateProduct}
							loading={loading}
							isEdit
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
