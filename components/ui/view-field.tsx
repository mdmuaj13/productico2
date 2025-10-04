import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface ViewFieldProps {
	label: string;
	value?: ReactNode;
	icon?: ReactNode;
	className?: string;
}

export function ViewField({ label, value, icon, className }: ViewFieldProps) {
	return (
		<div className="space-y-2">
			<Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
				{icon}
				{label}
			</Label>
			<div className={`p-3 bg-muted/50 rounded-md ${className || ''}`}>
				{value}
			</div>
		</div>
	);
}

export function formatDate(dateString: string) {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}
