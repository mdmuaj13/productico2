import SubscriptionsList from '@/components/subscriptions/subscriptions-list';

export default function SubscriptionsPage() {
	return (
		<div className="container mx-auto py-8 space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
				<p className="text-muted-foreground mt-2">
					Manage subscription plans and pricing tiers
				</p>
			</div>

			<SubscriptionsList />
		</div>
	);
}
