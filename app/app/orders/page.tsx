import { OrdersList } from '@/components/orders/orders-list';

const OrdersPage = () => {
	return (
		<div>
			<div className="flex-1 space-y-4 p-8 pt-6">
				<OrdersList />
			</div>
		</div>
	);
};

export default OrdersPage;
