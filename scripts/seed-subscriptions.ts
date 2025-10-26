import mongoose from 'mongoose';
import Subscription from '../models/Subscription';
import connectDB from '../lib/db';

const subscriptionData = [
	{
		name: 'Free',
		displayName: 'Free Plan',
		description: 'Perfect for getting started with basic features',
		price: 0,
		billingCycle: 'monthly',
		features: [
			'Up to 10 products',
			'Up to 3 categories',
			'Basic reporting',
			'Email support',
		],
		permissions: {
			products: {
				maxCount: 10,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			categories: {
				maxCount: 3,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			purchaseOrders: {
				maxCount: 20,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			expenses: {
				maxCount: 20,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			vendors: {
				maxCount: 5,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			warehouses: {
				maxCount: 1,
				canCreate: true,
				canEdit: true,
				canDelete: false,
			},
			orders: {
				maxCount: 50,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			users: {
				maxCount: 1,
				canCreate: false,
				canEdit: true,
				canDelete: false,
			},
			advancedReporting: false,
			apiAccess: false,
			bulkImport: false,
			customBranding: false,
		},
		isActive: true,
		sortOrder: 1,
	},
	{
		name: 'Pro',
		displayName: 'Pro Plan',
		description: 'Unlimited access to all features for growing businesses',
		price: 49.99,
		billingCycle: 'monthly',
		features: [
			'Unlimited products',
			'Unlimited categories',
			'Unlimited purchase orders',
			'Unlimited expenses',
			'Unlimited vendors',
			'Unlimited warehouses',
			'Unlimited orders',
			'Up to 10 users',
			'Advanced reporting & analytics',
			'API access',
			'Bulk import/export',
			'Priority support',
		],
		permissions: {
			products: {
				maxCount: -1, // -1 means unlimited
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			categories: {
				maxCount: -1,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			purchaseOrders: {
				maxCount: -1,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			expenses: {
				maxCount: -1,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			vendors: {
				maxCount: -1,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			warehouses: {
				maxCount: -1,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			orders: {
				maxCount: -1,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			users: {
				maxCount: 10,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			advancedReporting: true,
			apiAccess: true,
			bulkImport: true,
			customBranding: false,
		},
		isActive: true,
		sortOrder: 2,
	},
	{
		name: 'Custom',
		displayName: 'Custom Plan',
		description: 'Tailored solution for enterprises with specific needs',
		price: 0, // Custom pricing
		billingCycle: 'custom',
		features: [
			'Everything in Pro',
			'Unlimited users',
			'Custom integrations',
			'Custom branding',
			'Dedicated account manager',
			'Custom SLA',
			'On-premise deployment option',
			'Custom training',
		],
		permissions: {
			products: {
				maxCount: -1,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			categories: {
				maxCount: -1,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			purchaseOrders: {
				maxCount: -1,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			expenses: {
				maxCount: -1,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			vendors: {
				maxCount: -1,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			warehouses: {
				maxCount: -1,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			orders: {
				maxCount: -1,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			users: {
				maxCount: -1,
				canCreate: true,
				canEdit: true,
				canDelete: true,
			},
			advancedReporting: true,
			apiAccess: true,
			bulkImport: true,
			customBranding: true,
			customIntegrations: true,
			dedicatedSupport: true,
			onPremise: true,
		},
		isActive: true,
		sortOrder: 3,
	},
];

async function seedSubscriptions() {
	try {
		await connectDB();

		console.log('🌱 Seeding subscriptions...');

		// Clear existing subscriptions (optional)
		await Subscription.deleteMany({});
		console.log('✓ Cleared existing subscriptions');

		// Insert subscription data
		const result = await Subscription.insertMany(subscriptionData);
		console.log(`✓ Created ${result.length} subscription plans`);

		result.forEach((sub) => {
			console.log(`  - ${sub.displayName} (${sub.name})`);
		});

		console.log('✅ Subscription seeding completed!');
	} catch (error) {
		console.error('❌ Error seeding subscriptions:', error);
		throw error;
	} finally {
		await mongoose.connection.close();
	}
}

// Run the seed function
if (require.main === module) {
	seedSubscriptions()
		.then(() => process.exit(0))
		.catch(() => process.exit(1));
}

export { seedSubscriptions, subscriptionData };
