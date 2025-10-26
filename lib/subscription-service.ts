import User from '@/models/User';
import Subscription from '@/models/Subscription';

export interface SubscriptionPermissions {
	products?: {
		maxCount: number;
		canCreate: boolean;
		canEdit: boolean;
		canDelete: boolean;
	};
	categories?: {
		maxCount: number;
		canCreate: boolean;
		canEdit: boolean;
		canDelete: boolean;
	};
	purchaseOrders?: {
		maxCount: number;
		canCreate: boolean;
		canEdit: boolean;
		canDelete: boolean;
	};
	expenses?: {
		maxCount: number;
		canCreate: boolean;
		canEdit: boolean;
		canDelete: boolean;
	};
	vendors?: {
		maxCount: number;
		canCreate: boolean;
		canEdit: boolean;
		canDelete: boolean;
	};
	warehouses?: {
		maxCount: number;
		canCreate: boolean;
		canEdit: boolean;
		canDelete: boolean;
	};
	orders?: {
		maxCount: number;
		canCreate: boolean;
		canEdit: boolean;
		canDelete: boolean;
	};
	users?: {
		maxCount: number;
		canCreate: boolean;
		canEdit: boolean;
		canDelete: boolean;
	};
	advancedReporting?: boolean;
	apiAccess?: boolean;
	bulkImport?: boolean;
	customBranding?: boolean;
	customIntegrations?: boolean;
	dedicatedSupport?: boolean;
	onPremise?: boolean;
	[key: string]: any;
}

/**
 * Get user's effective permissions based on subscription and overrides
 */
export async function getUserPermissions(
	userId: string
): Promise<SubscriptionPermissions> {
	const user = await User.findOne({ _id: userId, deletedAt: null }).populate(
		'subscription'
	);

	if (!user) {
		throw new Error('User not found');
	}

	if (!user.subscription) {
		// Return default free permissions if no subscription
		return getDefaultFreePermissions();
	}

	const subscription = user.subscription as any;
	let permissions = subscription.permissions || {};

	// Apply subscription overrides if any
	if (user.subscriptionOverride) {
		permissions = mergePermissions(permissions, user.subscriptionOverride);
	}

	return permissions;
}

/**
 * Check if user can perform a specific action
 */
export async function checkPermission(
	userId: string,
	resource: string,
	action: 'create' | 'edit' | 'delete'
): Promise<boolean> {
	const permissions = await getUserPermissions(userId);
	const resourcePermissions = permissions[resource];

	if (!resourcePermissions) {
		return false;
	}

	const actionKey = `can${action.charAt(0).toUpperCase() + action.slice(1)}`;
	return resourcePermissions[actionKey] === true;
}

/**
 * Check if user has reached the limit for a resource
 */
export async function checkResourceLimit(
	userId: string,
	resource: string,
	currentCount: number
): Promise<{ allowed: boolean; limit: number; isUnlimited: boolean }> {
	const permissions = await getUserPermissions(userId);
	const resourcePermissions = permissions[resource];

	if (!resourcePermissions) {
		return { allowed: false, limit: 0, isUnlimited: false };
	}

	const maxCount = resourcePermissions.maxCount || 0;

	// -1 means unlimited
	if (maxCount === -1) {
		return { allowed: true, limit: -1, isUnlimited: true };
	}

	return {
		allowed: currentCount < maxCount,
		limit: maxCount,
		isUnlimited: false,
	};
}

/**
 * Check if user has access to a feature
 */
export async function checkFeatureAccess(
	userId: string,
	feature: string
): Promise<boolean> {
	const permissions = await getUserPermissions(userId);
	return permissions[feature] === true;
}

/**
 * Get subscription by name
 */
export async function getSubscriptionByName(name: string) {
	return await Subscription.findOne({
		name,
		deletedAt: null,
		isActive: true,
	});
}

/**
 * Get all active subscriptions
 */
export async function getActiveSubscriptions() {
	return await Subscription.find({
		deletedAt: null,
		isActive: true,
	}).sort({ sortOrder: 1 });
}

/**
 * Merge two permission objects (override takes precedence)
 */
function mergePermissions(
	base: SubscriptionPermissions,
	override: SubscriptionPermissions
): SubscriptionPermissions {
	const merged = { ...base };

	for (const key in override) {
		if (typeof override[key] === 'object' && !Array.isArray(override[key])) {
			merged[key] = { ...base[key], ...override[key] };
		} else {
			merged[key] = override[key];
		}
	}

	return merged;
}

/**
 * Get default free tier permissions
 */
function getDefaultFreePermissions(): SubscriptionPermissions {
	return {
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
	};
}
