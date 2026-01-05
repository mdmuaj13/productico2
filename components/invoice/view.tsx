"use client";

import * as React from "react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import {
  Edit,
  CircleDot,
  Printer,
  CalendarClock,
  FileText,
} from "lucide-react";

import { Invoice as InvoiceType, InvoiceItem } from "@/hooks/invoice";

interface InvoiceViewProps {
  invoice: InvoiceType;
  onEdit: () => void;
  onSuccess: () => void;
}

function formatMoney(amount: number) {
  return `৳${Number(amount || 0).toFixed(2)}`;
}

function titleCase(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function invoiceStatusBadgeVariant(status: InvoiceType["status"]) {
  switch (status) {
    case "overdue":
      return "destructive";
    case "draft":
      return "secondary";
    case "sent":
    case "paid":
    default:
      return "default";
  }
}

function paymentBadgeVariant(status: InvoiceType["paymentStatus"]) {
  switch (status) {
    case "unpaid":
      return "destructive";
    case "partial":
      return "secondary";
    case "paid":
    default:
      return "default";
  }
}

function toDateLabel(input: any) {
  try {
    const d = new Date(input);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  } catch {
    return "—";
  }
}

export function InvoiceView({ invoice, onEdit }: InvoiceViewProps) {
  const previewPrintRef = useRef<HTMLDivElement | null>(null);

  const dueIsPositive = Number(invoice.due || 0) > 0;

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

    // Copy styles (best-effort)
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

  const invoiceNo = invoice.invoiceNo || "—";

  const clientName = invoice.clientName || "—";
  const clientEmail = invoice.clientEmail || "";
  const clientMobile = invoice.clientMobile || "";
  const clientAddress = invoice.clientAddress || "—";
  const clientDistrict = (invoice as any).clientDistrict || "";

  const invoiceDate = toDateLabel(invoice.invoiceDate);
  const dueDate = toDateLabel(invoice.dueDate);

  const items: InvoiceItem[] = invoice.items || [];

  const subTotal = Number(invoice.subTotal || 0);
  const discount = Number(invoice.discount || 0);
  const tax = Number(invoice.tax || 0);
  const total = Number(invoice.total || 0);
  const paid = Number(invoice.paid || 0);
  const due = Number(invoice.due || 0);

  const notes = invoice.notes || "";
  const terms = invoice.terms || "";

  return (
    <div className="h-full overflow-y-auto pb-6 px-2 md:px-6">
      {/* Header */}
      <SheetHeader className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SheetTitle className="text-2xl">Invoice</SheetTitle>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                {invoiceNo}
              </Badge>

              <Badge
                variant={invoiceStatusBadgeVariant(invoice.status)}
                className="gap-1"
              >
                <CircleDot className="h-3.5 w-3.5" />
                {titleCase(invoice.status)}
              </Badge>

              <Badge variant={paymentBadgeVariant(invoice.paymentStatus)}>
                {titleCase(invoice.paymentStatus)}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={onEdit}
              size="sm"
              variant="outline"
              className="shrink-0"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>

            <Button
              type="button"
              onClick={handlePrintPreviewOnly}
              size="sm"
              variant="outline"
              className="shrink-0"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </SheetHeader>

      {/* Only preview + printable area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Preview</CardTitle>
          <div className="text-xs text-muted-foreground">
            Click <span className="font-medium">Print</span> to print only the
            preview.
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-4">
            {/* Printable root */}
            <div
              ref={previewPrintRef}
              className="rounded-2xl border p-5 bg-card"
            >
              {/* Top section */}
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

                {/* invoice date at top-right */}
                <div className="text-right">
                  <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Invoice date
                  </div>
                  <div className="text-sm font-semibold">{invoiceDate}</div>
                </div>
              </div>

              {/* Billed to + due date */}
              <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border">
                <div className="p-3">
                  <div className="text-xs text-muted-foreground">Billed to</div>
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
                  <div className="text-xs text-muted-foreground">Due date</div>
                  <div className="mt-1 font-semibold">{dueDate}</div>

                  <div className="text-xs text-muted-foreground mt-2">
                    Payment status
                  </div>
                  <div className="mt-1">
                    <Badge
                      variant={paymentBadgeVariant(invoice.paymentStatus)}
                      className="capitalize"
                    >
                      {invoice.paymentStatus || "—"}
                    </Badge>
                  </div>
                </div>

                <div className="col-span-2 p-3 border-t">
                  <div className="text-xs text-muted-foreground">Address</div>
                  <div className="mt-1 text-sm">
                    {clientAddress}
                    {clientDistrict ? (
                      <span className="text-muted-foreground">
                        , {clientDistrict}
                      </span>
                    ) : null}
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
                  {items.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-muted-foreground">
                      No items
                    </div>
                  ) : (
                    items.map((it, idx) => (
                      <div
                        key={it._id || `${idx}`}
                        className="grid grid-cols-12 px-3 py-2 text-sm"
                      >
                        <div className="col-span-6 font-medium">
                          {it.title || "—"}
                        </div>
                        <div className="col-span-2 text-right">
                          {Number(it.quantity || 0)}
                        </div>

                        {/* remove two decimals for Rate */}
                        <div className="col-span-2 text-right">
                          {Math.round(Number((it as any).price ?? 0))}
                        </div>

                        {/* remove two decimals for Total */}
                        <div className="col-span-2 text-right font-semibold">
                          {Math.round(Number((it as any).lineTotal ?? 0))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="mt-5 flex justify-end">
                <div className="w-full sm:w-72 rounded-xl border p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatMoney(subTotal)}</span>
                  </div>

                  {discount ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium">
                        {formatMoney(discount)}
                      </span>
                    </div>
                  ) : null}

                  {tax ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">{formatMoney(tax)}</span>
                    </div>
                  ) : null}

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
                    <span
                      className={cn(
                        "font-bold",
                        dueIsPositive ? "text-red-600" : "text-emerald-600"
                      )}
                    >
                      {formatMoney(due)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {invoice.status || "draft"}
                </Badge>
                <Badge
                  variant={paymentBadgeVariant(invoice.paymentStatus)}
                  className="capitalize"
                >
                  {invoice.paymentStatus || "unpaid"}
                </Badge>
              </div>

              {/* Notes then Terms at bottom */}
              {(notes || terms) && (
                <div className="mt-6 space-y-3">
                  {notes && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-semibold text-muted-foreground">
                        * Notes:
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

              {/* Optional footer/meta */}
              {(invoice as any).deletedAt ? (
                <div className="mt-6 text-xs text-muted-foreground flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Deleted at: {toDateLabel((invoice as any).deletedAt)}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
