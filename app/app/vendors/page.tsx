import { VendorsList } from '@/components/vendors/vendors-list';

const VendorsPage = () => {
	return (
		<div>
			<div className="flex-1 space-y-4 p-4 pt-6 lg:p-6">
				<VendorsList />
			</div>
		</div>
	);
};

export default VendorsPage;