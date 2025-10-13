'use client';

import * as React from 'react';
import {
	IconDashboard,
	IconDatabase,
	IconFolder,
	IconBuildingCastle,
	IconListDetails,
	IconReport,
	IconSettings,
	IconUsers,
	IconShoppingCart,
	IconPackage,
	IconTruck,
	IconBuilding,
	IconFileInvoice,
} from '@tabler/icons-react';

import { NavDocuments } from '@/components/nav-documents';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';

const data = {
	navMain: [
		{
			title: 'Dashboard',
			url: '/app/dashboard',
			icon: IconDashboard,
		},
		{
			title: 'Warehouses',
			url: '/app/warehouses',
			icon: IconBuilding,
		},
		{
			title: 'Products',
			url: '/app/products',
			icon: IconPackage,
		},
		{
			title: 'Categories',
			url: '/app/categories',
			icon: IconFolder,
		},
		{
			title: 'Orders',
			url: '/app/orders',
			icon: IconShoppingCart,
		},
		{
			title: 'Customers',
			url: '/app/customers',
			icon: IconUsers,
		},
		{
			title: 'Stock',
			url: '/app/stock',
			icon: IconDatabase,
		},

		{
			title: 'Vendors',
			url: '/app/vendors',
			icon: IconTruck,
		},
		{
			title: 'Purchase Orders',
			url: '/app/purchase-orders',
			icon: IconFileInvoice,
		},
	],
	navClouds: [],
	navSecondary: [
		{
			title: 'Settings',
			url: '/app/settings',
			icon: IconSettings,
		},
	],
	documents: [
		{
			name: 'Public',
			url: '/app/storefront',
			icon: IconReport,
		},
		{
			name: 'Order Tracking',
			url: '/app/track',
			icon: IconListDetails,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5">
							<Link href="/app">
								<IconBuildingCastle className="!size-5" />
								<span className="text-base font-semibold">Thread Park</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavDocuments items={data.documents} />
				{/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
