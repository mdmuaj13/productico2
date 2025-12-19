import { PurchaseOrdersList } from '@/components/purchase-orders/purchase-orders-list';

const PurchaseOrdersPage = () => {
	return (
		<div>
			<div className="flex-1 space-y-4 p-4 pt-6 lg:p-6">
				<PurchaseOrdersList />
			</div>
		</div>
	);
};

export default PurchaseOrdersPage;