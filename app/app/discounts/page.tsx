import { DiscountsList } from '@/components/discounts/discounts-list';

export default function DiscountsPage() {
	return (
		<div>
			<div className="flex-1 space-y-4 p-4 pt-6 lg:p-6">
				<DiscountsList />
			</div>
		</div>
	);
}
