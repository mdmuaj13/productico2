'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
	Edit,
	Package,
	User,
	MapPin,
	Phone,
	Mail,
	CreditCard,
	Calendar,
	Hash,
	StickyNote,
	CircleDot,
	FileText,
	CalendarClock,
	Receipt,
} from 'lucide-react';

import {Invoice as InvoiceType, InvoiceItem} from '@/hooks/invoice';

interface InvoiceViewProps {
	invoice: InvoiceType;
	onEdit: () => void;
	onSuccess: () => void; // kept for parity if you use it
}

function cn(...classes: Array<string | false | null | undefined>) {
	return classes.filter(Boolean).join(' ');
}

function formatMoney(amount: number) {
	return `৳${amount.toFixed(2)}`;
}

function formatDateTime(input: string | number | Date) {
	try {
		return new Date(input).toLocaleString();
	} catch {
		return String(input);
	}
}

function titleCase(s: string) {
	return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function invoiceStatusBadgeVariant(status: InvoiceType['status']) {
	switch (status) {
		case 'overdue':
			return 'destructive';
		case 'draft':
			return 'secondary';
		case 'sent':
		case 'paid':
		default:
			return 'default';
	}
}

function paymentBadgeVariant(status: InvoiceType['paymentStatus']) {
	switch (status) {
		case 'unpaid':
			return 'destructive';
		case 'partial':
			return 'secondary';
		case 'paid':
		default:
			return 'default';
	}
}

function KeyValue({
	icon,
	label,
	value,
	className,
	mono,
}: {
	icon?: React.ReactNode;
	label: string;
	value: React.ReactNode;
	className?: string;
	mono?: boolean;
}) {
	return (
		<div className={cn('flex items-start gap-3 rounded-xl border bg-card p-3', className)}>
			<div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
			<div className="min-w-0 flex-1">
				<p className="text-xs text-muted-foreground">{label}</p>
				<div className={cn('text-sm font-medium break-words', mono && 'font-mono')}>
					{value}
				</div>
			</div>
		</div>
	);
}

export function InvoiceView({ invoice, onEdit }: InvoiceViewProps) {
	const dueIsPositive = invoice.due > 0;

	return (
		<div className="h-full overflow-y-auto pb-6 px-2 md:px-6">
			{/* Header */}
			<SheetHeader className="mb-5">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<SheetTitle className="text-2xl">Invoice</SheetTitle>

						<div className="mt-1 flex flex-wrap items-center gap-2">
							<Badge variant="secondary" className="font-mono">
								{invoice.invoiceNo}
							</Badge>

							<Badge variant={invoiceStatusBadgeVariant(invoice.status)} className="gap-1">
								<CircleDot className="h-3.5 w-3.5" />
								{titleCase(invoice.status)}
							</Badge>

							<Badge variant={paymentBadgeVariant(invoice.paymentStatus)}>
								{titleCase(invoice.paymentStatus)}
							</Badge>
						</div>
					</div>

					<Button onClick={onEdit} size="sm" variant="outline" className="shrink-0">
						<Edit className="h-4 w-4 mr-2" />
						Edit
					</Button>
				</div>
			</SheetHeader>

			<div className="space-y-2">
				{/* Client */}
				<Card className="overflow-hidden">
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<User className="h-4 w-4" />
							Client
						</CardTitle>
					</CardHeader>

					<CardContent className="grid gap-3 sm:grid-cols-2">
						<KeyValue
							icon={<User className="h-4 w-4" />}
							label="Name"
							value={invoice.clientName}
						/>
						<KeyValue
							icon={<Phone className="h-4 w-4" />}
							label="Mobile"
							value={invoice.clientMobile}
							mono
						/>
						{invoice.clientEmail ? (
							<KeyValue
								icon={<Mail className="h-4 w-4" />}
								label="Email"
								value={invoice.clientEmail}
							/>
						) : null}

						<KeyValue
							icon={<MapPin className="h-4 w-4" />}
							label="Address"
							value={
								<div className="space-y-1">
									<div>{invoice.clientAddress}</div>
									{/* If you store district/city in clientDistrict */}
									{(invoice as any).clientDistrict ? (
										<div className="text-xs text-muted-foreground">
											{(invoice as any).clientDistrict}
										</div>
									) : null}
								</div>
							}
							className="sm:col-span-2"
						/>
					</CardContent>
				</Card>

				{/* Invoice details */}
				<Card className="overflow-hidden">
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<FileText className="h-4 w-4" />
							Invoice Details
						</CardTitle>
					</CardHeader>

					<CardContent className="grid gap-3 sm:grid-cols-2">
						<KeyValue
							icon={<Hash className="h-4 w-4" />}
							label="Invoice No"
							value={invoice.invoiceNo}
							mono
						/>
						{invoice.referenceNo ? (
							<KeyValue
								icon={<Receipt className="h-4 w-4" />}
								label="Reference No"
								value={invoice.referenceNo}
								mono
							/>
						) : null}

						<KeyValue
							icon={<Calendar className="h-4 w-4" />}
							label="Invoice Date"
							value={formatDateTime(invoice.invoiceDate)}
						/>
						<KeyValue
							icon={<CalendarClock className="h-4 w-4" />}
							label="Due Date"
							value={formatDateTime(invoice.dueDate)}
						/>
					</CardContent>
				</Card>

				{/* Items */}
				<Card className="overflow-hidden">
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<Package className="h-4 w-4" />
							Items
							<Badge variant="secondary" className="ml-2">
								{invoice.items.length}
							</Badge>
						</CardTitle>
					</CardHeader>

					<CardContent className="space-y-3">
						{invoice.items.map((item: InvoiceItem, index: number) => (
							<div key={index} className="rounded-xl border bg-card p-3">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0 flex-1">
										<p className="text-sm font-semibold leading-tight wrap-break-word">
											{item.title}
										</p>
									</div>

									<div className="text-right shrink-0">
										<p className="text-xs text-muted-foreground">Line total</p>
										<p className="text-sm font-semibold">{formatMoney(item.lineTotal)}</p>
									</div>
								</div>

								<Separator className="my-2" />

								<div className="grid grid-cols-3 gap-2 text-xs">
									<div className="rounded-lg bg-accent/30 px-2 py-1">
										<p className="text-muted-foreground">Price</p>
										<p className="text-xs font-medium">{formatMoney(item.price)}</p>
									</div>
									<div className="rounded-lg bg-accent/30 px-2 py-1">
										<p className="text-muted-foreground">Qty</p>
										<p className="text-xs font-medium">{item.quantity}</p>
									</div>
									<div className="rounded-lg bg-accent/30 px-2 py-1">
										<p className="text-muted-foreground">Total</p>
										<p className="text-xs font-medium">{formatMoney(item.lineTotal)}</p>
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				{/* Summary */}
				<Card className="overflow-hidden">
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<CreditCard className="h-4 w-4" />
							Summary
						</CardTitle>
					</CardHeader>

					<CardContent className="space-y-3">
						<div className="grid gap-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-muted-foreground">Subtotal</span>
								<span className="font-medium">{formatMoney(invoice.subTotal)}</span>
							</div>

							{invoice.discount > 0 ? (
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Discount</span>
									<span className="font-medium text-emerald-600">
										-{formatMoney(invoice.discount)}
									</span>
								</div>
							) : null}

							{invoice.tax > 0 ? (
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Tax</span>
									<span className="font-medium">+{formatMoney(invoice.tax)}</span>
								</div>
							) : null}

							<Separator />

							<div className="rounded-xl border bg-accent/30 p-3">
								<div className="flex items-center justify-between">
									<span className="text-sm font-semibold">Total</span>
									<span className="text-base font-bold text-primary">
										{formatMoney(invoice.total)}
									</span>
								</div>
							</div>

							<div className="grid gap-2 sm:grid-cols-2">
								<div className="rounded-xl border bg-card p-3">
									<p className="text-xs text-muted-foreground">Paid</p>
									<p className="text-sm font-semibold text-emerald-600">
										{formatMoney(invoice.paid)}
									</p>
								</div>

								<div className="rounded-xl border bg-card p-3">
									<p className="text-xs text-muted-foreground">Due</p>
									<p
										className={cn(
											'text-sm font-semibold',
											dueIsPositive ? 'text-rose-600' : 'text-emerald-600'
										)}
									>
										{formatMoney(invoice.due)}
									</p>
								</div>
							</div>

							<div className="grid gap-2 sm:grid-cols-2">
								{/* <KeyValue
									icon={<CreditCard className="h-4 w-4" />}
									label="Payment type"
									value={<span className="capitalize">{invoice.paymentType}</span>}
								/> */}
								<KeyValue
									icon={<CircleDot className="h-4 w-4" />}
									label="Payment status"
									value={<span className="capitalize">{invoice.paymentStatus}</span>}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Notes / Terms */}
				{invoice.notes || invoice.terms ? (
					<Card className="overflow-hidden">
						<CardHeader className="pb-3">
							<CardTitle className="text-base flex items-center gap-2">
								<StickyNote className="h-4 w-4" />
								Notes &amp; Terms
							</CardTitle>
						</CardHeader>

						<CardContent className="space-y-3">
							{invoice.notes ? (
								<div>
									<div className="text-sm font-semibold mb-2">Notes</div>
									<div className="rounded-xl border bg-accent/30 p-3 text-sm leading-relaxed">
										{invoice.notes}
									</div>
								</div>
							) : null}

							{invoice.terms ? (
								<div>
									<div className="text-sm font-semibold mb-2">Terms</div>
									<div className="rounded-xl border bg-accent/30 p-3 text-sm leading-relaxed">
										{invoice.terms}
									</div>
								</div>
							) : null}
						</CardContent>
					</Card>
				) : null}

				{/* Meta */}
				<Card className="overflow-hidden">
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Invoice Info</CardTitle>
					</CardHeader>

					<CardContent className="grid gap-3 sm:grid-cols-2">
						<KeyValue
							icon={<Calendar className="h-4 w-4" />}
							label="Due Date"
							value={formatDateTime(invoice.dueDate)}
						/>
            {
              invoice?.deletedAt &&
              <KeyValue
							icon={<Calendar className="h-4 w-4" />}
							label="Deleted At"
							value={formatDateTime(invoice.deletedAt)}
						/>
            }
						
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
