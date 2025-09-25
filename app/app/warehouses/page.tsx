import { WarehousesList } from '@/components/warehouses/warehouses-list';

const WarehousesPage = () => {
	return (
		<div>
			{/* <SiteHeader /> */}
			<div className="flex-1 space-y-4 p-8 pt-6">
				<WarehousesList />
			</div>
		</div>
	);
};

export default WarehousesPage;
