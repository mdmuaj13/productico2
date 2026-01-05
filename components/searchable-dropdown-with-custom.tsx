'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DropdownOption = {
	_id: string;
	title: string;
	price?: number;
	salePrice?: number;
};

type Props = {
	options: DropdownOption[];
	value: string; // can be custom
	onChange: (title: string, meta?: { price?: number }) => void;
	placeholder?: string;
	disabled?: boolean;
	widthClassName?: string; // optional customization
};

export function SearchableDropdownWithCustom({
	options,
	value,
	onChange,
	placeholder = 'Select or type…',
	disabled,
	widthClassName,
}: Props) {
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState('');

	const q = query.trim().toLowerCase();

	const filtered = React.useMemo(() => {
		if (!q) return options;
		return options.filter((o) => o.title.toLowerCase().includes(q));
	}, [options, q]);

	const exactMatch = React.useMemo(() => {
		if (!q) return null;
		return options.find((o) => o.title.trim().toLowerCase() === q) ?? null;
	}, [options, q]);

	const canUseCustom = !!q && !exactMatch;

	const displayLabel = value?.trim() ? value : '';

	const handleUseCustom = () => {
		const name = query.trim();
		if (!name) return;
		onChange(name);
		setOpen(false);
		setQuery('');
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					role="combobox"
					disabled={disabled}
					className={cn('w-full justify-between', widthClassName)}
				>
					<span className="truncate text-left">
						{displayLabel ? displayLabel : placeholder}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-[360px] p-0" align="start">
				<Command>
					<CommandInput
						placeholder="Search or type item name…"
						value={query}
						onValueChange={setQuery}
					/>
					<CommandList>
						<CommandEmpty>
							<div className="p-2 text-sm text-muted-foreground">
								No match found.
							</div>
							{canUseCustom ? (
								<div className="p-2">
									<Button
										type="button"
										variant="secondary"
										className="w-full justify-start"
										onClick={handleUseCustom}
									>
										<Plus className="h-4 w-4 mr-2" />
										Use “{query.trim()}”
									</Button>
								</div>
							) : null}
						</CommandEmpty>

						{canUseCustom ? (
							<CommandGroup heading="Custom">
								<CommandItem value={`__custom__${query}`} onSelect={handleUseCustom}>
									<Plus className="mr-2 h-4 w-4" />
									Use “{query.trim()}”
								</CommandItem>
							</CommandGroup>
						) : null}

						<CommandGroup heading="Products">
							{filtered.map((o) => {
								const effectivePrice = o.salePrice ?? o.price;
								const isSelected = o.title === value;

								return (
									<CommandItem
										key={o._id}
										value={o.title}
										onSelect={() => {
											onChange(o.title, effectivePrice != null ? { price: effectivePrice } : undefined);
											setOpen(false);
											setQuery('');
										}}
									>
										<Check
											className={cn(
												'mr-2 h-4 w-4',
												isSelected ? 'opacity-100' : 'opacity-0'
											)}
										/>
										<span className="flex-1 truncate">{o.title}</span>
										{effectivePrice != null ? (
											<span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
												৳{Number(effectivePrice).toFixed(2)}
											</span>
										) : null}
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
