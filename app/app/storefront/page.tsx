'use client';

import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShopInfoForm } from '@/components/storefront/shop-info-form';
import { ContactForm } from '@/components/storefront/contact-form';
import { PolicyEditor } from '@/components/storefront/policy-editor';
import { FeaturedProductsForm } from '@/components/storefront/featured-products-form';
import { Loader2 } from 'lucide-react';

interface StorefrontData {
	[key: string]: {
		_id: string;
		type: string;
		value: Record<string, unknown>;
		createdAt: string;
		updatedAt: string;
	};
}

export default function StorefrontPage() {
	const [storefrontData, setStorefrontData] = useState<StorefrontData>({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchAllStorefronts = async () => {
			try {
				const response = await apiCall('/api/storefront?type=all');
				if (response.status_code === 200 && response.data) {
					setStorefrontData(response.data);
				}
			} catch (error) {
				console.error('Failed to fetch storefronts:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchAllStorefronts();
	}, []);

	const handleDataUpdate = (type: string, data: Record<string, unknown>) => {
		setStorefrontData((prev) => ({
			...prev,
			[type]: {
				...prev[type],
				type,
				value: data,
				updatedAt: new Date().toISOString(),
			} as StorefrontData[string],
		}));
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div>
			<div className="flex-1 space-y-4 p-4 pt-6 lg:p-6">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-bold tracking-tight">Storefront Settings</h2>
				</div>

				<Tabs defaultValue="info" className="space-y-4">
					<div className="w-full overflow-x-auto">
						<TabsList className="inline-flex w-auto min-w-full justify-start">
							<TabsTrigger value="info">Shop Info</TabsTrigger>
							<TabsTrigger value="contact">Contact</TabsTrigger>
							<TabsTrigger value="featured">Featured Products</TabsTrigger>
							<TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
							<TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
							<TabsTrigger value="refund">Refund Policy</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent value="info">
						<ShopInfoForm 
							initialData={storefrontData.info?.value} 
							onUpdate={(data) => handleDataUpdate('info', data)}
						/>
					</TabsContent>

					<TabsContent value="contact">
						<ContactForm 
							initialData={storefrontData.contact?.value}
							onUpdate={(data) => handleDataUpdate('contact', data)}
						/>
					</TabsContent>

					<TabsContent value="featured">
						<FeaturedProductsForm 
							initialData={storefrontData.featured?.value}
							onUpdate={(data) => handleDataUpdate('featured', data)}
						/>
					</TabsContent>

					<TabsContent value="terms">
						<PolicyEditor 
							type="terms" 
							title="Terms & Conditions"
							initialData={storefrontData.terms?.value}
							onUpdate={(data) => handleDataUpdate('terms', data)}
						/>
					</TabsContent>

					<TabsContent value="privacy">
						<PolicyEditor 
							type="privacy" 
							title="Privacy Policy"
							initialData={storefrontData.privacy?.value}
							onUpdate={(data) => handleDataUpdate('privacy', data)}
						/>
					</TabsContent>

					<TabsContent value="refund">
						<PolicyEditor 
							type="refund" 
							title="Refund Policy"
							initialData={storefrontData.refund?.value}
							onUpdate={(data) => handleDataUpdate('refund', data)}
						/>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
