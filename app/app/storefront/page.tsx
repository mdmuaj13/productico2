import { StorefrontForm } from '@/components/storefront/storefront-form';

export default function StorefrontPage() {
	return (
		<div>
			<div className="flex-1 space-y-4 p-4 pt-6 lg:p-6">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-bold tracking-tight">Storefront Settings</h2>
				</div>
				<StorefrontForm />
			</div>
		</div>
	);
}
