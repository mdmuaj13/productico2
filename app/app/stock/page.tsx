import { StocksList } from '@/components/stocks/stocks-list';

const StockPage = () => {
	return (
		<div>
			<div className="flex-1 space-y-4 p-8 pt-6">
				<StocksList />
			</div>
		</div>
	);
};

export default StockPage;
