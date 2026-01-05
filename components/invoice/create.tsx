'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { InvoiceFormData } from '@/types/invoice';

import {
	CalendarClock,
	FileText,
	Plus,
	Trash2,
} from 'lucide-react';


type LineItemUI = {
	id: string;
	description: string;
	quantity: number;
	rate: number;
	amount: number; // qty * rate
};

interface InvoiceFormProps {
	onSuccess: () => void;
}

function uid() {
	return `li-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatMoney(amount: number) {
	return `৳${Number(amount || 0).toFixed(2)}`;
}

function toISOFromLocalInput(localValue: string) {
	// localValue: "YYYY-MM-DDTHH:mm"
	const d = new Date(localValue);
	return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function toLocalDateInput(date: Date) {
	const pad = (n: number) => String(n).padStart(2, '0');
	const yyyy = date.getFullYear();
	const mm = pad(date.getMonth() + 1);
	const dd = pad(date.getDate());
	return `${yyyy}-${mm}-${dd}`;
}

export function InvoiceForm({ onSuccess }: InvoiceFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPreview, setShowPreview] = useState(true);

	// screenshot-style items
	const [items, setItems] = useState<LineItemUI[]>([
		{ id: uid(), description: 'Web Design', quantity: 1, rate: 500, amount: 500 },
	]);

	const invoiceNoDefault = `INV-${Date.now()}`;

	const invoiceDateDefault = useMemo(() => {
		// screenshot shows date only, we’ll store ISO; input uses date
		return new Date();
	}, []);
	const dueDateDefault = useMemo(() => {
		const d = new Date();
		d.setDate(d.getDate() + 7);
		return d;
	}, []);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		control,
		formState: { errors },
	} = useForm<InvoiceFormData>({
		defaultValues: {
			invoiceNo: invoiceNoDefault,
			invoiceDate: invoiceDateDefault.toISOString(),
			dueDate: dueDateDefault.toISOString(),

			clientName: '',
			clientMobile: '',
			clientEmail: '',
			clientAddress: '',
			clientCity: '',

			status: 'draft',
			paymentStatus: 'unpaid',
			discount: 0,
			tax: 0,
			paid: 0,
			notes: '',
			terms: '',
		} as any,
	});

	const clientName = watch('clientName') || '—';
	const clientEmail = watch('clientEmail') || '';
	const clientMobile = watch('clientMobile') || '';
	const clientAddress = watch('clientAddress') || '—';
	const clientCity = watch('clientCity') || '';

	const invoiceNo = watch('invoiceNo') || invoiceNoDefault;
	const invoiceDateISO = watch('invoiceDate') || invoiceDateDefault.toISOString();
	const dueDateISO = watch('dueDate') || dueDateDefault.toISOString();

	const discount = Number(watch('discount') || 0);
	const tax = Number(watch('tax') || 0);
	const paid = Number(watch('paid') || 0);

	const subTotal = useMemo(
		() => items.reduce((sum, it) => sum + Number(it.amount || 0), 0),
		[items]
	);
	const total = Math.max(subTotal - discount + tax, 0);
	const due = Math.max(total - paid, 0);

	useEffect(() => {
		// keep form fields aligned for backend payload
		setValue('subTotal', subTotal as any);
		setValue('total', total as any);
		setValue('due', due as any);
	}, [subTotal, total, due, setValue]);

	const updateItem = (id: string, patch: Partial<LineItemUI>) => {
		setItems((prev) =>
			prev.map((it) => {
				if (it.id !== id) return it;
				const next = { ...it, ...patch };

				const qty = Number(next.quantity || 0);
				const rate = Number(next.rate || 0);
				next.amount = Math.max(qty * rate, 0);

				return next;
			})
		);
	};

	const addItem = () => {
		setItems((prev) => [
			...prev,
			{ id: uid(), description: '', quantity: 1, rate: 0, amount: 0 },
		]);
	};

	const removeItem = (id: string) => {
		setItems((prev) => prev.filter((it) => it.id !== id));
	};

	const buildPayload = (data: InvoiceFormData, forceStatus?: 'draft' | 'sent') => {
		// Map screenshot-style items to your backend "items" structure.
		// Your backend expects items with fields like: title/quantity/price/lineTotal.
		const backendItems = items.map((it) => ({
			// _id is required in your earlier zod/model. If you truly require it, generate ObjectId on server.
			// For now we pass string id; server can accept string and cast or you can relax validation.
			_id: it.id,
			title: it.description || 'Item',
			slug: undefined,
			thumbnail: undefined,

			basePrice: Number(it.rate || 0),
			price: Number(it.rate || 0),
			quantity: Number(it.quantity || 0),

			variantName: null,
			variantPrice: null,
			variantSalePrice: null,

			warehouseId: null,
			lineTotal: Number(it.amount || 0),
		}));

		return {
			clientName: data.clientName,
			clientMobile: data.clientMobile,
			clientEmail: data.clientEmail,
			clientAddress: data.clientAddress,
			clientDistrict: (data as any).clientCity ?? '',

			invoiceNo: data.invoiceNo,
			invoiceDate: data.invoiceDate,
			dueDate: data.dueDate,

			items: backendItems,

			subTotal,
			discount,
			tax,
			total,

			paid,
			due,

			paymentStatus: data.paymentStatus,
			paymentType: (data as any).paymentType ?? 'cash',

			status: forceStatus ?? data.status,

			notes: data.notes,
			terms: data.terms,
		};
	};

	const submit = async (data: InvoiceFormData, forceStatus?: 'draft' | 'sent') => {
		if (items.length === 0) {
			toast.error('Please add at least one item');
			return;
		}

		// Basic item validation like screenshot UX
		const hasInvalid = items.some(
			(it) => !it.description?.trim() || Number(it.quantity) <= 0 || Number(it.rate) < 0
		);
		if (hasInvalid) {
			toast.error('Please fill item description and valid quantity/rate');
			return;
		}

		setIsSubmitting(true);
		try {
			const payload = buildPayload(data, forceStatus);

			// ✅ use plural route (matches what we used earlier)
			const res = await fetch('/api/invoices', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const result = await res.json();
			if (!res.ok) throw new Error(result.error || 'Failed to create invoice');

			toast.success(forceStatus === 'sent' ? 'Invoice sent successfully' : 'Invoice saved');
			onSuccess();
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Something went wrong';
			toast.error(msg);
			console.error(e);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onSubmit = async (data: InvoiceFormData) => submit(data);

	return (
		<div className="h-full overflow-y-auto px-2 md:px-4 pb-6">
			{/* Top Bar (like screenshot) */}
			<SheetHeader className="mb-4">
				<div className="flex items-center justify-between gap-3">
					<div className="min-w-0">
						<SheetTitle className="text-xl md:text-2xl flex items-center gap-2">
							<FileText className="h-5 w-5" />
							New Invoice
						</SheetTitle>
					</div>

					<div className="flex items-center gap-2">
						{/* Show Preview toggle */}
						<Button
							type="button"
							variant="outline"
							className="hidden sm:inline-flex"
							onClick={() => setShowPreview((v) => !v)}
						>
							{showPreview ? 'Hide Preview' : 'Show Preview'}
						</Button>

						<Button
							type="button"
							variant="outline"
							disabled={isSubmitting}
							onClick={handleSubmit((data) => submit(data, 'draft'))}
						>
							Save as Draft
						</Button>

						<Button
							type="button"
							disabled={isSubmitting}
							onClick={handleSubmit((data) => submit(data, 'sent'))}
						>
							Send Invoice
						</Button>
					</div>
				</div>
			</SheetHeader>

			<form onSubmit={handleSubmit(onSubmit)}>
				<div
					className={cn(
						'grid gap-4',
						showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
					)}
				>
					{/* LEFT COLUMN */}
					<div className="space-y-4">
						{/* Invoice details (matches screenshot) */}
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Invoice details</CardTitle>
							</CardHeader>

							<CardContent className="space-y-4">
								{/* Bill to */}
								<div className="space-y-2">
									<Label className="text-sm">Bill to</Label>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<div>
											<Label htmlFor="clientName" className="text-xs text-muted-foreground">
												Client name <span className="text-red-500">*</span>
											</Label>
											<Input
												id="clientName"
												placeholder="Acme Enterprise"
												{...register('clientName', { required: 'Client name is required' })}
												className={cn((errors as any).clientName && 'border-red-500')}
											/>
											{(errors as any).clientName && (
												<p className="text-xs text-red-500 mt-1">
													{(errors as any).clientName.message}
												</p>
											)}
										</div>

										<div>
											<Label htmlFor="clientEmail" className="text-xs text-muted-foreground">
												Email
											</Label>
											<Input
												id="clientEmail"
												type="email"
												placeholder="cme@enterprise.com"
												{...register('clientEmail')}
											/>
										</div>

										<div>
											<Label htmlFor="clientMobile" className="text-xs text-muted-foreground">
												Phone <span className="text-red-500">*</span>
											</Label>
											<Input
												id="clientMobile"
												placeholder="01XXXXXXXXX"
												{...register('clientMobile', { required: 'Mobile is required' })}
												className={cn((errors as any).clientMobile && 'border-red-500')}
											/>
											{(errors as any).clientMobile && (
												<p className="text-xs text-red-500 mt-1">
													{(errors as any).clientMobile.message}
												</p>
											)}
										</div>

										<div>
											<Label htmlFor="clientCity" className="text-xs text-muted-foreground">
												City
											</Label>
											<Input
												id="clientCity"
												placeholder="Dhaka"
												{...register('clientCity')}
											/>
										</div>
									</div>
								</div>

								{/* Invoice no + due date */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<div>
										<Label htmlFor="invoiceNo" className="text-sm">
											Invoice number
										</Label>
										<Input
											id="invoiceNo"
											readOnly
											className="bg-muted font-mono text-xs"
											{...register('invoiceNo')}
										/>
									</div>

									<div>
										<Label htmlFor="dueDate" className="text-sm flex items-center gap-2">
											<CalendarClock className="h-4 w-4" />
											Due date
										</Label>
										<Input
											id="dueDate"
											type="date"
											defaultValue={toLocalDateInput(new Date(dueDateISO))}
											onChange={(e) => setValue('dueDate', toISOFromLocalInput(`${e.target.value}T00:00`) as any)}
										/>
									</div>
								</div>

								{/* Invoice date */}
								<div>
									<Label htmlFor="invoiceDate" className="text-sm flex items-center gap-2">
										<CalendarClock className="h-4 w-4" />
										Invoice date
									</Label>
									<Input
										id="invoiceDate"
										type="date"
										defaultValue={toLocalDateInput(new Date(invoiceDateISO))}
										onChange={(e) => setValue('invoiceDate', toISOFromLocalInput(`${e.target.value}T00:00`) as any)}
									/>
								</div>

								{/* Address */}
								<div>
									<Label htmlFor="clientAddress" className="text-sm">
										Address <span className="text-red-500">*</span>
									</Label>
									<Input
										id="clientAddress"
										placeholder="1901 Thornridge Cir. Shiloh..."
										{...register('clientAddress', { required: 'Address is required' })}
										className={cn((errors as any).clientAddress && 'border-red-500')}
									/>
									{(errors as any).clientAddress && (
										<p className="text-xs text-red-500 mt-1">
											{(errors as any).clientAddress.message}
										</p>
									)}
								</div>

								{/* Status + payment */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<div>
										<Label className="text-sm">Status</Label>
										<Controller
											name="status"
											control={control}
											render={({ field }) => (
												<Select onValueChange={field.onChange} defaultValue={field.value as any}>
													<SelectTrigger>
														<SelectValue placeholder="Select status" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="draft">Draft</SelectItem>
														<SelectItem value="sent">Sent</SelectItem>
														<SelectItem value="paid">Paid</SelectItem>
														<SelectItem value="overdue">Overdue</SelectItem>
													</SelectContent>
												</Select>
											)}
										/>
									</div>

									<div>
										<Label className="text-sm">Payment</Label>
										<Controller
											name="paymentStatus"
											control={control}
											render={({ field }) => (
												<Select onValueChange={field.onChange} defaultValue={field.value as any}>
													<SelectTrigger>
														<SelectValue placeholder="Select payment status" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="unpaid">Unpaid</SelectItem>
														<SelectItem value="partial">Partial</SelectItem>
														<SelectItem value="paid">Paid</SelectItem>
													</SelectContent>
												</Select>
											)}
										/>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Invoice items (table like screenshot) */}
						<Card>
							<CardHeader className="pb-2 flex flex-row items-center justify-between">
								<CardTitle className="text-base">Invoice items</CardTitle>
								<Button type="button" variant="outline" size="sm" onClick={addItem}>
									<Plus className="h-4 w-4 mr-2" />
									Add item
								</Button>
							</CardHeader>

							<CardContent>
								<div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground mb-2">
									<div className="col-span-6">Items</div>
									<div className="col-span-2 text-right">QTY</div>
									<div className="col-span-2 text-right">Rate</div>
									<div className="col-span-2 text-right">Total</div>
								</div>

								<div className="space-y-2">
									{items.map((it) => (
										<div key={it.id} className="grid grid-cols-12 gap-2 items-center">
											<div className="col-span-6">
												<Input
													value={it.description}
													onChange={(e) => updateItem(it.id, { description: e.target.value })}
													placeholder="Web Design"
												/>
											</div>

											<div className="col-span-2">
												<Input
													type="number"
													min={1}
													value={it.quantity}
													onChange={(e) => updateItem(it.id, { quantity: Number(e.target.value || 0) })}
													className="text-right"
												/>
											</div>

											<div className="col-span-2">
												<Input
													type="number"
													min={0}
													step="0.01"
													value={it.rate}
													onChange={(e) => updateItem(it.id, { rate: Number(e.target.value || 0) })}
													className="text-right"
												/>
											</div>

											<div className="col-span-2 flex items-center justify-end gap-2">
												<Input value={it.amount} readOnly className="text-right bg-muted" />
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => removeItem(it.id)}
													className="text-red-500 hover:text-red-600"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									))}
								</div>

								<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
									<div>
										<Label className="text-sm">Discount (৳)</Label>
										<Input
											type="number"
											min={0}
											step="0.01"
											{...register('discount', { valueAsNumber: true })}
										/>
									</div>

									<div>
										<Label className="text-sm">Tax (৳)</Label>
										<Input type="number" min={0} step="0.01" {...register('tax', { valueAsNumber: true })} />
									</div>

									<div>
										<Label className="text-sm">Paid (৳)</Label>
										<Input type="number" min={0} step="0.01" {...register('paid', { valueAsNumber: true })} />
									</div>
								</div>

								<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
									<div>
										<Label className="text-sm">Notes</Label>
										<Textarea rows={3} placeholder="Any notes..." {...register('notes')} />
									</div>
									<div>
										<Label className="text-sm">Terms</Label>
										<Textarea rows={3} placeholder="Payment terms..." {...register('terms')} />
									</div>
								</div>

								{/* small totals box like screenshot */}
								<div className="mt-4 ml-auto w-full md:w-72 rounded-xl border p-3 space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Subtotal</span>
										<span className="font-medium">{formatMoney(subTotal)}</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Discount</span>
										<span className="font-medium">{formatMoney(discount)}</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Tax</span>
										<span className="font-medium">{formatMoney(tax)}</span>
									</div>
									<div className="h-px bg-border my-2" />
									<div className="flex items-center justify-between">
										<span className="font-semibold">Total</span>
										<span className="font-bold">{formatMoney(total)}</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Fallback create button (mobile) */}
						<div className="lg:hidden">
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? 'Creating…' : 'Create Invoice'}
							</Button>
						</div>
					</div>

					{/* RIGHT COLUMN (Preview like screenshot) */}
					{showPreview ? (
						<div className="space-y-4">
							<Card className="sticky top-3">
								<CardHeader className="pb-2">
									<CardTitle className="text-base">Preview</CardTitle>
								</CardHeader>

								<CardContent className="p-4">
									<div className="rounded-2xl border p-5 bg-card">
										<div className="flex items-start justify-between gap-3">
											<div>
												<div className="text-2xl font-bold">Invoice</div>
												<div className="mt-2 text-sm text-muted-foreground">
													Invoice Number{' '}
													<span className="font-mono text-foreground ml-2">
														{invoiceNo}
													</span>
												</div>
											</div>

											<div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
												<FileText className="h-5 w-5 text-green-700" />
											</div>
										</div>

										<div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border">
											<div className="p-3">
												<div className="text-xs text-muted-foreground">Billed to</div>
												<div className="mt-1 font-semibold">{clientName}</div>
												{clientEmail ? (
													<div className="text-xs text-muted-foreground">{clientEmail}</div>
												) : null}
												{clientMobile ? (
													<div className="text-xs text-muted-foreground">{clientMobile}</div>
												) : null}
											</div>

											<div className="p-3 border-l">
												<div className="text-xs text-muted-foreground">Due date</div>
												<div className="mt-1 font-semibold">
													{new Date(dueDateISO).toLocaleDateString()}
												</div>
												<div className="text-xs text-muted-foreground mt-2">Invoice date</div>
												<div className="font-semibold">
													{new Date(invoiceDateISO).toLocaleDateString()}
												</div>
											</div>

											<div className="col-span-2 p-3 border-t">
												<div className="text-xs text-muted-foreground">Address</div>
												<div className="mt-1 text-sm">
													{clientAddress}
													{clientCity ? <span className="text-muted-foreground">, {clientCity}</span> : null}
												</div>
											</div>
										</div>

										{/* Items table */}
										<div className="mt-5 rounded-xl border overflow-hidden">
											<div className="grid grid-cols-12 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
												<div className="col-span-6">Items</div>
												<div className="col-span-2 text-right">QTY</div>
												<div className="col-span-2 text-right">Rate</div>
												<div className="col-span-2 text-right">Total</div>
											</div>

											<div className="divide-y">
												{items.map((it) => (
													<div key={it.id} className="grid grid-cols-12 px-3 py-2 text-sm">
														<div className="col-span-6 font-medium">
															{it.description || '—'}
														</div>
														<div className="col-span-2 text-right">{it.quantity}</div>
														<div className="col-span-2 text-right">{formatMoney(it.rate)}</div>
														<div className="col-span-2 text-right font-semibold">
															{formatMoney(it.amount)}
														</div>
													</div>
												))}
											</div>
										</div>

										{/* Totals */}
										<div className="mt-5 flex justify-end">
											<div className="w-full sm:w-72 rounded-xl border p-3 space-y-2">
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">Subtotal</span>
													<span className="font-medium">{formatMoney(subTotal)}</span>
												</div>
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">Discount</span>
													<span className="font-medium">{formatMoney(discount)}</span>
												</div>
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">Tax</span>
													<span className="font-medium">{formatMoney(tax)}</span>
												</div>
												<div className="h-px bg-border my-2" />
												<div className="flex justify-between">
													<span className="font-semibold">Total</span>
													<span className="font-bold">{formatMoney(total)}</span>
												</div>
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">Paid</span>
													<span className="font-medium">{formatMoney(paid)}</span>
												</div>
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">Due</span>
													<span className={cn('font-bold', due > 0 ? 'text-red-600' : 'text-emerald-600')}>
														{formatMoney(due)}
													</span>
												</div>
											</div>
										</div>

										{/* Small badges */}
										<div className="mt-4 flex flex-wrap gap-2">
											<Badge variant="secondary" className="capitalize">
												{watch('status') || 'draft'}
											</Badge>
											<Badge
												variant={
													watch('paymentStatus') === 'unpaid'
														? 'destructive'
														: watch('paymentStatus') === 'partial'
														? 'secondary'
														: 'default'
												}
												className="capitalize"
											>
												{watch('paymentStatus') || 'unpaid'}
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Small hint */}
							<p className="text-xs text-muted-foreground">
							Preview updates live based on your inputs.
							</p>
						</div>
					) : null}
				</div>
			</form>
		</div>
	);
}
