import { ProductsList } from '@/components/products/products-list';

export default function ProductsPage() {
	return (
		<div>
			<div className="flex-1 space-y-4 p-8 pt-6">
				<ProductsList />
			</div>
		</div>
	);
}
