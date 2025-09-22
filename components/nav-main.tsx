'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';

// Define a more flexible icon type
type IconType = React.ComponentType<{
	className?: string;
	size?: string | number;
}>;

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: IconType;
	}[];
}) {
	const router = useRouter();
	const pathname = usePathname();

	// Function to check if a navigation item is active
	const isActive = (url: string) => {
		// Handle exact matches and nested routes
		if (url === '/dashboard' && pathname === '/dashboard') {
			return true;
		}
		if (url === '/menu' && pathname.startsWith('/menu')) {
			return true;
		}
		if (url === '/item' && pathname.startsWith('/item')) {
			return true;
		}
		if (url === '/reservation' && pathname.startsWith('/reservation')) {
			return true;
		}
		if (url === '/storefront' && pathname.startsWith('/storefront')) {
			return true;
		}
		if (url === '/users' && pathname.startsWith('/users')) {
			return true;
		}
		return false;
	};

	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					{items.map((item) => {
						const active = isActive(item.url);
						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									tooltip={item.title}
									className={`cursor-pointer transition-colors duration-200 ${
										active
											? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
											: 'hover:bg-accent hover:text-accent-foreground'
									}`}
									onClick={() => router.push(`${item?.url}`)}>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
