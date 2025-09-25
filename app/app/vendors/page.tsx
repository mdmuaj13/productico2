import { VendorsList } from '@/components/vendors/vendors-list';

const VendorsPage = () => {
	return (
		<div>
			{/* <SiteHeader /> */}
			<div className="flex-1 space-y-4 p-8 pt-6">
				<VendorsList />
			</div>
		</div>
	);
};

export default VendorsPage;