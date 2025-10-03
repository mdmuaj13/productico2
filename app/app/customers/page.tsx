import { CustomersList } from '@/components/customers/customers-list';

const CustomersPage = () => {
	return (
		<div>
			<div className="flex-1 space-y-4 p-8 pt-6">
				<CustomersList />
			</div>
		</div>
	);
};

export default CustomersPage;
