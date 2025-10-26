'use client';

import { useSubscriptions } from '@/hooks/subscriptions';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Spinner } from '../ui/shadcn-io/spinner';

interface ISubscription {
	_id: string;
	name: string;
	displayName: string;
	description?: string;
	price: number;
	billingCycle: string;
	features: string[];
	isActive: boolean;
}

interface PricingCardsProps {
	onSelectPlan?: (subscription: ISubscription) => void;
	currentPlanId?: string;
}

export default function PricingCards({
	onSelectPlan,
	currentPlanId,
}: PricingCardsProps) {
	const { data: subscriptionsData, error } = useSubscriptions({
		isActive: true,
		limit: 100,
	});

	const subscriptions = subscriptionsData?.data || [];

	if (error) {
		return (
			<div className="text-center py-8">
				<p className="text-red-500">Error loading subscription plans</p>
			</div>
		);
	}

	if (!subscriptionsData) {
		return (
			<div className="flex justify-center py-8">
				<Spinner />
			</div>
		);
	}

	const getPlanStyle = (planName: string) => {
		switch (planName) {
			case 'Pro':
				return {
					border: 'border-blue-500',
					badge: 'bg-blue-500',
					button: 'bg-blue-500 hover:bg-blue-600',
				};
			case 'Custom':
				return {
					border: 'border-purple-500',
					badge: 'bg-purple-500',
					button: 'bg-purple-500 hover:bg-purple-600',
				};
			default:
				return {
					border: 'border-gray-200',
					badge: 'bg-gray-500',
					button: '',
				};
		}
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
			{subscriptions.map((subscription: ISubscription) => {
				const style = getPlanStyle(subscription.name);
				const isCurrent = currentPlanId === subscription._id;

				return (
					<Card
						key={subscription._id}
						className={`relative ${style.border} ${subscription.name === 'Pro' ? 'border-2 shadow-lg' : ''}`}
					>
						{subscription.name === 'Pro' && (
							<div
								className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${style.badge} text-white px-3 py-1 rounded-full text-xs font-semibold`}
							>
								MOST POPULAR
							</div>
						)}

						<CardHeader>
							<CardTitle className="text-2xl">{subscription.displayName}</CardTitle>
							<CardDescription>{subscription.description}</CardDescription>
						</CardHeader>

						<CardContent className="space-y-6">
							<div className="flex items-baseline gap-2">
								{subscription.billingCycle === 'custom' ? (
									<span className="text-3xl font-bold">Custom</span>
								) : (
									<>
										<span className="text-4xl font-bold">
											${subscription.price}
										</span>
										<span className="text-muted-foreground">
											/{subscription.billingCycle}
										</span>
									</>
								)}
							</div>

							<ul className="space-y-3">
								{subscription.features.map((feature, index) => (
									<li key={index} className="flex items-start gap-2">
										<Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
										<span className="text-sm">{feature}</span>
									</li>
								))}
							</ul>
						</CardContent>

						<CardFooter>
							{isCurrent ? (
								<Button className="w-full" variant="outline" disabled>
									Current Plan
								</Button>
							) : (
								<Button
									className={`w-full ${subscription.name === 'Pro' ? style.button + ' text-white' : ''}`}
									variant={subscription.name === 'Pro' ? 'default' : 'outline'}
									onClick={() => onSelectPlan?.(subscription)}
								>
									{subscription.name === 'Custom'
										? 'Contact Sales'
										: 'Select Plan'}
								</Button>
							)}
						</CardFooter>
					</Card>
				);
			})}
		</div>
	);
}
