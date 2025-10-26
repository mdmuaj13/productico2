import PricingCards from '@/components/subscriptions/pricing-cards';

export default function PricingPage() {
	return (
		<div className="container mx-auto py-12 space-y-8">
			<div className="text-center space-y-4">
				<h1 className="text-4xl font-bold tracking-tight">
					Choose Your Plan
				</h1>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
					Select the perfect plan for your business needs. Upgrade or downgrade
					at any time.
				</p>
			</div>

			<PricingCards />
		</div>
	);
}
