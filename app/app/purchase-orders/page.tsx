import { PurchaseOrdersList } from '@/components/purchase-orders/purchase-orders-list';

const PurchaseOrdersPage = () => {
	return (
		<div>
			{/* <SiteHeader /> */}
			<div className="flex-1 space-y-4 p-8 pt-6">
				<PurchaseOrdersList />
			</div>
		</div>
	);
};

export default PurchaseOrdersPage;