import { CategoriesList } from '@/components/categories/categories-list';

const CategoryPage = () => {
	return (
		<div>
			{/* <SiteHeader /> */}
			<div className="flex-1 space-y-4 p-8 pt-6">
				<CategoriesList />
			</div>
		</div>
	);
};

export default CategoryPage;
