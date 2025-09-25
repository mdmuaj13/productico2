import { AppSidebar } from '@/components/app-sidebar';
import AuthGuard from '@/components/auth-guard';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AuthGuard>
			<SidebarProvider
				style={
					{
						'--sidebar-width': 'calc(var(--spacing) * 72)',
						'--header-height': 'calc(var(--spacing) * 12)',
					} as React.CSSProperties
				}>
				<AppSidebar variant="inset" />
				<SidebarInset>
					<SiteHeader />
					<div>{children}</div>
				</SidebarInset>
			</SidebarProvider>
		</AuthGuard>
	);
}
