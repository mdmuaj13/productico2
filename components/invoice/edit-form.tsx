"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { cn } from "@/lib/utils";
import { toast } from "sonner";

import type { InvoiceFormData } from "@/types/invoice";

import { CalendarClock, FileText, Plus, Trash2, Printer } from "lucide-react";

import { normalizeApiErrors } from "@/lib/utils/form-error";

/** adjust this type to your real Invoice type */
type InvoiceItemApi = {
  _id: string;
  title: string;
  price: number;
  basePrice?: number;
  quantity: number;
  lineTotal: number;

  slug?: string;
  description?: string;
  shortDetail?: string;
  thumbnail?: string;

  variantName?: string | null;
  variantPrice?: number | null;
  variantSalePrice?: number | null;
  warehouseId?: string | null;
};

type InvoiceApi = {
  _id: string;

  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;

  clientName: string;
  clientMobile: string;
  clientEmail?: string;
  clientAddress: string;
  clientDistrict?: string; // UI uses clientCity but backend stores district

  status: "draft" | "sent" | "paid" | "overdue";
  paymentStatus: "unpaid" | "partial" | "paid";

  discount: number;
  tax: number;
  paid: number;

  subTotal: number;
  total: number;
  due: number;

  notes?: string;
  terms?: string;

  items: InvoiceItemApi[];
};

type LineItemUI = {
  id: string; // maps to item._id (or generated)
  title: string;
  quantity: number;
  rate: number; // maps to basePrice/price
  amount: number; // qty * rate
};

interface InvoiceEditFormProps {
  invoice: InvoiceApi;
  onSuccess: () => void;
  onCancel?: () => void;
}

function uid() {
  return `li-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatMoney(amount: number) {
  return `৳${Number(amount || 0).toFixed(2)}`;
}

function toISOFromLocalInput(localValue: string) {
  const d = new Date(localValue);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}

function toLocalDateInput(dateOrIso?: string | Date) {
  const d = dateOrIso ? new Date(dateOrIso) : new Date("");
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

export function InvoiceEditForm({
  invoice,
  onSuccess,
  onCancel,
}: InvoiceEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [apiErrors, setApiErrors] = useState<
    Array<{ field?: string; message: string }>
  >([]);

  const previewPrintRef = useRef<HTMLDivElement | null>(null);

  const handlePrintPreviewOnly = () => {
    const node = previewPrintRef.current;
    if (!node) {
      toast.error("Nothing to print");
      return;
    }

    const printWindow = window.open("", "_blank", "width=900,height=650");
    if (!printWindow) {
      toast.error("Popup blocked. Please allow popups to print.");
      return;
    }

    const styleLinks = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]')
    )
      .map((link) => (link as HTMLLinkElement).href)
      .filter(Boolean)
      .map((href) => `<link rel="stylesheet" href="${href}" />`)
      .join("\n");

    const inlineStyles = Array.from(document.querySelectorAll("style"))
      .map((style) => style.outerHTML)
      .join("\n");

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Invoice</title>
          ${styleLinks}
          ${inlineStyles}
          <style>
            @page { margin: 16mm; }
            body { background: white; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body>
          <div id="print-root"></div>
          <script>
            window.onload = function () {
              window.focus();
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();

    const root = printWindow.document.getElementById("print-root");
    if (root) root.innerHTML = node.outerHTML;
  };

  // Map invoice items to UI state
  const initialItems: LineItemUI[] = useMemo(() => {
    const src = invoice?.items || [];
    if (src.length === 0) {
      return [{ id: uid(), title: "", quantity: 1, rate: 0, amount: 0 }];
    }

    return src.map((it) => {
      const rate = Number(
        typeof it.basePrice === "number" ? it.basePrice : it.price || 0
      );
      const qty = Number(it.quantity || 1);
      return {
        id: String(it._id || uid()),
        title: String(it.title || ""),
        quantity: qty,
        rate,
        amount: Math.max(qty * rate, 0),
      };
    });
  }, [invoice]);

  const [items, setItems] = useState<LineItemUI[]>(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    defaultValues: {
      invoiceNo: invoice.invoiceNo,
      invoiceDate: invoice.invoiceDate || new Date().toISOString(),
      dueDate: invoice.dueDate || "",

      clientName: invoice.clientName || "",
      clientMobile: invoice.clientMobile || "",
      clientEmail: invoice.clientEmail || "",
      clientAddress: invoice.clientAddress || "",
      clientCity: (invoice as any).clientDistrict || "",

      status: invoice.status || "draft",
      paymentStatus: invoice.paymentStatus || "unpaid",

      discount: Number(invoice.discount || 0),
      tax: Number(invoice.tax || 0),
      paid: Number(invoice.paid || 0),

      notes: invoice.notes || "",
      terms: invoice.terms || "",
    } as any,
  });

  const clientName = watch("clientName") || "—";
  const clientEmail = watch("clientEmail") || "";
  const clientMobile = watch("clientMobile") || "";
  const clientAddress = watch("clientAddress") || "—";
  const clientCity = watch("clientCity") || "";

  const invoiceNo = watch("invoiceNo") || invoice.invoiceNo;
  const invoiceDateISO = watch("invoiceDate") || invoice.invoiceDate;
  const dueDateISO = watch("dueDate") || "";

  const discount = Number(watch("discount") || 0);
  const tax = Number(watch("tax") || 0);
  const paid = Number(watch("paid") || 0);

  const notes = watch("notes") || "";
  const terms = watch("terms") || "";

  const subTotal = useMemo(
    () => items.reduce((sum, it) => sum + Number(it.amount || 0), 0),
    [items]
  );

  const total = Math.max(subTotal - discount + tax, 0);
  const due = Math.max(total - paid, 0);

  useEffect(() => {
    setValue("subTotal", subTotal as any);
    setValue("total", total as any);
    setValue("due", due as any);
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

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: uid(), title: "", quantity: 1, rate: 0, amount: 0 },
    ]);

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const validateItems = () => {
    if (items.length === 0) return "Please add at least one item.";
    const invalid = items.some(
      (it) =>
        !it.title.trim() || Number(it.quantity) <= 0 || Number(it.rate) < 0
    );
    if (invalid) return "Please fill item name and valid quantity/rate.";
    return null;
  };

  const validateDueDate = () => {
    const iso = watch("dueDate");
    if (!iso || !String(iso).trim()) {
      setError("dueDate" as any, {
        type: "required",
        message: "Due date is required",
      });
      return false;
    }
    return true;
  };

  const onSubmit = async (data: InvoiceFormData) => {
    clearErrors();
    setApiErrors([]);

    const itemError = validateItems();
    if (itemError) {
      toast.error(itemError);
      return;
    }

    if (!validateDueDate()) {
      toast.error("Due date is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const payloadItems = items.map((it) => ({
        _id: String(it.id),
        title: String(it.title),
        basePrice: Number(it.rate || 0),
        price: Number(it.rate || 0),
        quantity: Number(it.quantity || 1),
        lineTotal: Number(it.amount || 0),
      }));

      const payload = {
        clientName: data.clientName,
        clientMobile: data.clientMobile,
        clientEmail: data.clientEmail,
        clientAddress: data.clientAddress,
        clientDistrict: (data as any).clientCity ?? "",

        invoiceNo: data.invoiceNo,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,

        items: payloadItems,

        subTotal,
        discount,
        tax,
        total,

        paid,
        due,

        paymentStatus: data.paymentStatus,
        paymentType: (data as any).paymentType ?? "cash",
        status: data.status,

        notes: data.notes,
        terms: data.terms,
      };

      const res = await fetch(`/api/invoice/${invoice._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        const parsed = normalizeApiErrors(result);

        setApiErrors(parsed);

        parsed.forEach((e) => {
          if (!e.field) return;
          setError(e.field as any, { type: "server", message: e.message });
        });

        toast.error(parsed[0]?.message || "Validation error");
        return;
      }

      toast.success("Invoice updated successfully");
      onSuccess();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-2 md:px-4 pb-6">
      <SheetHeader className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <SheetTitle className="text-xl md:text-2xl flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Edit Invoice
            </SheetTitle>
          </div>

          <div className="flex items-center gap-2">
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : null}

            <Button
              type="button"
              variant="outline"
              className="hidden sm:inline-flex"
              onClick={() => setShowPreview((v) => !v)}>
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>

            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}>
              {isSubmitting ? "Updating…" : "Update Invoice"}
            </Button>
          </div>
        </div>
      </SheetHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        {apiErrors.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm mb-4">
            <ul className="list-disc pl-5 space-y-1 text-red-700">
              {apiErrors.map((e, idx) => (
                <li key={idx}>
                  {e.field ? (
                    <span className="font-medium">{e.field}: </span>
                  ) : null}
                  {e.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div
          className={cn(
            "grid gap-4",
            showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
          )}>
          {/* LEFT */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Invoice details</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Bill to</Label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="clientName"
                        className="text-xs text-muted-foreground">
                        Client name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="clientName"
                        placeholder="Acme Enterprise"
                        {...register("clientName", {
                          required: "Client name is required",
                        })}
                        className={cn(
                          (errors as any).clientName && "border-red-500"
                        )}
                      />
                      {(errors as any).clientName && (
                        <p className="text-xs text-red-500 mt-1">
                          {(errors as any).clientName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="clientEmail"
                        className="text-xs text-muted-foreground">
                        Email
                      </Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        placeholder="acme@enterprise.com"
                        {...register("clientEmail")}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="clientMobile"
                        className="text-xs text-muted-foreground">
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="clientMobile"
                        placeholder="01XXXXXXXXX"
                        {...register("clientMobile", {
                          required: "Mobile is required",
                        })}
                        className={cn(
                          (errors as any).clientMobile && "border-red-500"
                        )}
                      />
                      {(errors as any).clientMobile && (
                        <p className="text-xs text-red-500 mt-1">
                          {(errors as any).clientMobile.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="clientCity"
                        className="text-xs text-muted-foreground">
                        City
                      </Label>
                      <Input
                        id="clientCity"
                        placeholder="Dhaka"
                        {...register("clientCity")}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="invoiceNo" className="text-sm">
                      Invoice number
                    </Label>
                    <Input
                      id="invoiceNo"
                      readOnly
                      className="bg-muted font-mono text-xs"
                      {...register("invoiceNo")}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="dueDate"
                      className="text-sm flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" />
                      Due date <span className="text-red-500">*</span>
                    </Label>

                    <Input
                      id="dueDate"
                      type="date"
                      value={toLocalDateInput(dueDateISO)}
                      onChange={(e) => {
                        const v = e.target.value;
                        const iso = v ? toISOFromLocalInput(`${v}T00:00`) : "";
                        setValue("dueDate", iso as any);
                        if (!iso) {
                          setError("dueDate" as any, {
                            type: "required",
                            message: "Due date is required",
                          });
                        } else {
                          clearErrors("dueDate" as any);
                        }
                      }}
                      className={cn(
                        (errors as any).dueDate && "border-red-500"
                      )}
                    />
                    {(errors as any).dueDate && (
                      <p className="text-xs text-red-500 mt-1">
                        {(errors as any).dueDate.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="invoiceDate"
                    className="text-sm flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    Invoice date
                  </Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={toLocalDateInput(invoiceDateISO)}
                    onChange={(e) => {
                      const v = e.target.value;
                      const iso = v ? toISOFromLocalInput(`${v}T00:00`) : "";
                      if (iso) setValue("invoiceDate", iso as any);
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="clientAddress" className="text-sm">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="clientAddress"
                    placeholder="1901 Thornridge Cir. Shiloh..."
                    {...register("clientAddress", {
                      required: "Address is required",
                    })}
                    className={cn(
                      (errors as any).clientAddress && "border-red-500"
                    )}
                  />
                  {(errors as any).clientAddress && (
                    <p className="text-xs text-red-500 mt-1">
                      {(errors as any).clientAddress.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Status</Label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value as any}>
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value as any}>
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

            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Invoice items</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add item
                </Button>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground mb-2">
                  <div className="col-span-6">Items</div>
                  <div className="col-span-2 text-right">QTY</div>
                  <div className="col-span-2 text-right">Rate</div>
                </div>

                <div className="space-y-2">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <Input
                          value={it.title}
                          onChange={(e) =>
                            updateItem(it.id, { title: e.target.value })
                          }
                          placeholder="Item name (type anything)"
                        />
                      </div>

                      <div className="col-span-2">
                        <Input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) =>
                            updateItem(it.id, {
                              quantity: Number(e.target.value || 1),
                            })
                          }
                          className="text-right"
                        />
                      </div>

                      <div className="col-span-3">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={it.rate}
                          onChange={(e) =>
                            updateItem(it.id, {
                              rate: Number(e.target.value || 0),
                            })
                          }
                          className="text-right"
                        />
                      </div>

                      <div className="col-span-1 flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(it.id)}
                          className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Notes</Label>
                    <Textarea
                      rows={3}
                      placeholder="Any notes..."
                      {...register("notes")}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Terms</Label>
                    <Textarea
                      rows={3}
                      placeholder="Payment terms..."
                      {...register("terms")}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-sm">Discount (৳)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      {...register("discount", { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Tax (৳)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      {...register("tax", { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Paid (৳)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      {...register("paid", { valueAsNumber: true })}
                    />
                  </div>
                </div>

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
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Due</span>
                    <span
                      className={cn(
                        "font-bold",
                        due > 0 ? "text-red-600" : "text-emerald-600"
                      )}>
                      {formatMoney(due)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:hidden">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Updating…" : "Update Invoice"}
              </Button>
            </div>
          </div>

          {/* RIGHT: Preview */}
          {showPreview ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Preview</CardTitle>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrintPreviewOnly}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>

              <Card className="sticky top-3">
                <CardContent className="p-4">
                  <div
                    ref={previewPrintRef}
                    className="rounded-2xl border p-5 bg-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-2xl font-bold">Invoice</div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          Invoice Number{" "}
                          <span className="font-mono text-foreground ml-2">
                            {invoiceNo}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                          <CalendarClock className="h-3.5 w-3.5" />
                          Invoice date
                        </div>
                        <div className="text-sm font-semibold">
                          {invoiceDateISO
                            ? new Date(invoiceDateISO).toLocaleDateString()
                            : "—"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border">
                      <div className="p-3">
                        <div className="text-xs text-muted-foreground">
                          Billed to
                        </div>
                        <div className="mt-1 font-semibold">{clientName}</div>
                        {clientEmail ? (
                          <div className="text-xs text-muted-foreground">
                            {clientEmail}
                          </div>
                        ) : null}
                        {clientMobile ? (
                          <div className="text-xs text-muted-foreground">
                            {clientMobile}
                          </div>
                        ) : null}
                      </div>

                      <div className="p-3 border-l">
                        <div className="text-xs text-muted-foreground">
                          Due date
                        </div>
                        <div className="mt-1 font-semibold">
                          {dueDateISO
                            ? new Date(dueDateISO).toLocaleDateString()
                            : "—"}
                        </div>
                      </div>

                      <div className="col-span-2 p-3 border-t">
                        <div className="text-xs text-muted-foreground">
                          Address
                        </div>
                        <div className="mt-1 text-sm">
                          {clientAddress}
                          {clientCity ? (
                            <span className="text-muted-foreground">
                              , {clientCity}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border overflow-hidden">
                      <div className="grid grid-cols-12 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        <div className="col-span-6">Items</div>
                        <div className="col-span-2 text-right">QTY</div>
                        <div className="col-span-2 text-right">Rate</div>
                        <div className="col-span-2 text-right">Total</div>
                      </div>

                      <div className="divide-y">
                        {items.map((it) => (
                          <div
                            key={it.id}
                            className="grid grid-cols-12 px-3 py-2 text-sm">
                            <div className="col-span-6 font-medium">
                              {it.title || "—"}
                            </div>
                            <div className="col-span-2 text-right">
                              {it.quantity}
                            </div>
                            <div className="col-span-2 text-right">
                              {Math.round(it.rate)}
                            </div>
                            <div className="col-span-2 text-right font-semibold">
                              {Math.round(it.amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <div className="w-full sm:w-72 rounded-xl border p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Subtotal
                          </span>
                          <span className="font-medium">
                            {formatMoney(subTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Discount
                          </span>
                          <span className="font-medium">
                            {formatMoney(discount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax</span>
                          <span className="font-medium">
                            {formatMoney(tax)}
                          </span>
                        </div>
                        <div className="h-px bg-border my-2" />
                        <div className="flex justify-between">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold">
                            {formatMoney(total)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Paid</span>
                          <span className="font-medium">
                            {formatMoney(paid)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Due</span>
                          <span
                            className={cn(
                              "font-bold",
                              due > 0 ? "text-red-600" : "text-emerald-600"
                            )}>
                            {formatMoney(due)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {watch("status") || "draft"}
                      </Badge>
                      <Badge
                        variant={
                          watch("paymentStatus") === "unpaid"
                            ? "destructive"
                            : watch("paymentStatus") === "partial"
                            ? "secondary"
                            : "default"
                        }
                        className="capitalize">
                        {watch("paymentStatus") || "unpaid"}
                      </Badge>
                    </div>

                    {(notes || terms) && (
                      <div className="mt-6 space-y-3">
                        {notes && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-muted-foreground">
                              * Notes :
                            </span>
                            <span className="text-xs leading-relaxed whitespace-pre-wrap">
                              {notes}
                            </span>
                          </div>
                        )}

                        {terms && (
                          <div>
                            <div className="text-sm font-semibold text-muted-foreground mb-1">
                              * Terms
                            </div>
                            <div className="text-xs leading-relaxed whitespace-pre-wrap">
                              {terms}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
