"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Order } from "@/hooks/orders";
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
  Printer,
} from "lucide-react";

interface OrderViewProps {
  order: Order;
  onEdit: () => void;
  onSuccess: () => void;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatMoney(amount: number) {
  return `৳${Number(amount || 0).toFixed(2)}`;
}

function formatDateTime(input: string | number | Date) {
  try {
    return new Date(input).toLocaleString();
  } catch {
    return String(input);
  }
}

function statusLabel(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function statusBadgeVariant(status: Order["status"]) {
  switch (status) {
    case "cancelled":
      return "destructive";
    case "pending":
      return "secondary";
    case "processing":
    case "confirmed":
    case "shipped":
    case "delivered":
    default:
      return "default";
  }
}

function paymentBadgeVariant(status: Order["paymentStatus"]) {
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
    <div className={cn("flex items-start gap-3 rounded-xl border bg-card p-3", className)}>
      <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className={cn("text-sm font-medium break-words", mono && "font-mono")}>{value}</div>
      </div>
    </div>
  );
}

/**
 * ✅ Print invoice: opens a new window with printable HTML and triggers print.
 * You can customize the "Company" section easily below.
 */
function printInvoice(order: Order) {
  const escapeHtml = (s: unknown) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const money = (n: unknown) => `৳${Number(n || 0).toFixed(2)}`;

  const itemsRows = (order.products || [])
    .map((p, idx) => {
      const name = escapeHtml(p.title);
      const variant = p.variantName
        ? ` <span class="muted">(${escapeHtml(p.variantName)})</span>`
        : "";

      return `
        <tr>
          <td class="num">${idx + 1}</td>
          <td><div class="name">${name}${variant}</div></td>
          <td class="right">${money(p.price)}</td>
          <td class="right">${Number(p.quantity || 0)}</td>
          <td class="right">${money(p.lineTotal)}</td>
        </tr>
      `;
    })
    .join("");

  const subTotal = Number(order.subTotal || 0);
  const discount = Number(order.discount || 0);
  const delivery = Number(order.deliveryCost || 0);
  const tax = Number(order.tax || 0);
  const total = Number(order.total || 0);
  const paid = Number(order.paid || 0);
  const due = Number(order.due || 0);

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${escapeHtml(order.code)}</title>
  <style>
    :root { --text:#111; --muted:#666; --border:#e5e7eb; --bg:#fff; }
    * { box-sizing: border-box; }
    body { margin:0; padding:24px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; color:var(--text); background:var(--bg); }
    .container { max-width: 820px; margin: 0 auto; }
    .row { display:flex; justify-content:space-between; gap:16px; }
    .title { font-size: 22px; font-weight: 800; margin: 0; }
    .muted { color: var(--muted); font-size: 12px; }
    .box { border: 1px solid var(--border); border-radius: 12px; padding: 14px; }
    .mt { margin-top: 14px; }
    table { width:100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border-bottom: 1px solid var(--border); padding: 10px 8px; vertical-align: top; }
    th { text-align: left; font-size: 12px; color: var(--muted); font-weight: 700; }
    td { font-size: 13px; }
    .right { text-align: right; }
    .num { width: 32px; color: var(--muted); }
    .name { font-weight: 600; }
    .totals { margin-top: 10px; display:flex; justify-content:flex-end; }
    .totals table { width: 340px; }
    .totals td { border-bottom: none; padding: 6px 0; }
    .totals .label { color: var(--muted); }
    .totals .grand { font-size: 16px; font-weight: 900; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="row">
      <div>
        <p class="title">Invoice</p>
        <div class="muted">Order code: <strong>${escapeHtml(order.code)}</strong></div>
        <div class="muted">Created: ${escapeHtml(new Date(order.createdAt).toLocaleString())}</div>
      </div>
    </div>

    <div class="box mt">
      <div style="font-weight:800; margin-bottom:6px">Bill To</div>
      <div><strong>${escapeHtml(order.customerName)}</strong></div>
      <div class="muted">
        ${escapeHtml(order.customerMobile || "")}
        ${order.customerEmail ? ` • ${escapeHtml(order.customerEmail)}` : ""}
      </div>
      <div class="muted">
        ${escapeHtml(order.customerAddress || "")}
        ${order.customerDistrict ? `, ${escapeHtml(order.customerDistrict)}` : ""}
      </div>
    </div>

    <div class="box mt">
      <div style="font-weight:800; margin-bottom:6px">Items</div>
      <table>
        <thead>
          <tr>
            <th style="width:36px">#</th>
            <th>Item</th>
            <th class="right" style="width:110px">Price</th>
            <th class="right" style="width:80px">Qty</th>
            <th class="right" style="width:130px">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows || `<tr><td colspan="5" class="muted">No items</td></tr>`}
        </tbody>
      </table>

      <div class="totals">
        <table>
          <tr><td class="label">Subtotal</td><td class="right">${money(subTotal)}</td></tr>
          ${discount > 0 ? `<tr><td class="label">Discount</td><td class="right">-${money(discount)}</td></tr>` : ""}
          ${delivery > 0 ? `<tr><td class="label">Delivery</td><td class="right">+${money(delivery)}</td></tr>` : ""}
          ${tax > 0 ? `<tr><td class="label">Tax</td><td class="right">+${money(tax)}</td></tr>` : ""}
          <tr><td colspan="2"><hr style="border:none;border-top:1px solid var(--border);margin:8px 0" /></td></tr>
          <tr><td class="label grand">Total</td><td class="right grand">${money(total)}</td></tr>
          <tr><td class="label">Paid</td><td class="right">${money(paid)}</td></tr>
          <tr><td class="label"><strong>Due</strong></td><td class="right"><strong>${money(due)}</strong></td></tr>
        </table>
      </div>
    </div>

    ${
      order.remark
        ? `<div class="box mt"><div style="font-weight:800; margin-bottom:6px">Remark</div><div style="white-space:pre-wrap">${escapeHtml(
            order.remark
          )}</div></div>`
        : ""
    }
  </div>
</body>
</html>
  `;

  // ✅ No popup: print via hidden iframe
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  // wait a tick so layout/fonts apply
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    // cleanup
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 500);
  }, 150);
}


export function OrderView({ order, onEdit }: OrderViewProps) {
  const dueIsPositive = order.due > 0;

  console.log({order})

  return (
    <div className="h-full overflow-y-auto pb-6 px-2 md:px-6">
      {/* Header */}
      <SheetHeader className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SheetTitle className="text-2xl">Order</SheetTitle>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                {order.code}
              </Badge>

              <Badge variant={statusBadgeVariant(order.status)} className="gap-1">
                <CircleDot className="h-3.5 w-3.5" />
                {statusLabel(order.status)}
              </Badge>

              <Badge variant={paymentBadgeVariant(order.paymentStatus)}>
                {statusLabel(order.paymentStatus)}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => printInvoice(order)}
              size="sm"
              variant="outline"
            >
              <Printer className="h-4 w-4 mr-2" />
              Invoice
            </Button>

            <Button onClick={onEdit} size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </SheetHeader>

      <div className="space-y-2">
        {/* Customer */}
        <Card className="overflow-hidden">
          <CardHeader className="">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-2">
            <KeyValue icon={<User className="h-4 w-4" />} label="Name" value={order.customerName} />
            <KeyValue icon={<Phone className="h-4 w-4" />} label="Contact" value={order.customerMobile} mono />
            {order.customerEmail ? (
              <KeyValue icon={<Mail className="h-4 w-4" />} label="Email" value={order.customerEmail} />
            ) : null}
            <KeyValue
              icon={<MapPin className="h-4 w-4" />}
              label="Address"
              value={
                <div className="space-y-1">
                  <div>{order.customerAddress}</div>
                  {order.customerDistrict ? (
                    <div className="text-xs text-muted-foreground">{order.customerDistrict}</div>
                  ) : null}
                </div>
              }
              className={cn("sm:col-span-2")}
            />
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="overflow-hidden">
          <CardHeader className="">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
              <Badge variant="secondary" className="ml-2">
                {order.products.length}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {order.products.map((product, index) => (
              <div key={index} className="rounded-xl border bg-card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight break-words">{product.title}</p>
                    {product.variantName ? (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {product.variantName}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">Line total</p>
                    <p className="text-sm font-semibold">{formatMoney(product.lineTotal)}</p>
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-accent/30 px-2 py-1">
                    <p className="text-muted-foreground">Price</p>
                    <p className="text-xs font-medium">{formatMoney(product.price)}</p>
                  </div>
                  <div className="rounded-lg bg-accent/30 px-2 py-1">
                    <p className="text-muted-foreground">Qty</p>
                    <p className="text-xs font-medium">{product.quantity}</p>
                  </div>
                  <div className="rounded-lg bg-accent/30 px-2 py-1">
                    <p className="text-muted-foreground">Total</p>
                    <p className="text-xs font-medium">{formatMoney(product.lineTotal)}</p>
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
                <span className="font-medium">{formatMoney(order.subTotal)}</span>
              </div>

              {order.discount > 0 ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium text-emerald-600">-{formatMoney(order.discount)}</span>
                </div>
              ) : null}

              {order.deliveryCost > 0 ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">+{formatMoney(order.deliveryCost)}</span>
                </div>
              ) : null}

              {order.tax > 0 ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">+{formatMoney(order.tax)}</span>
                </div>
              ) : null}

              <Separator />

              <div className="rounded-xl border bg-accent/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-base font-bold text-primary">{formatMoney(order.total)}</span>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="text-sm font-semibold text-emerald-600">{formatMoney(order.paid)}</p>
                </div>

                <div className="rounded-xl border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Due</p>
                  <p className={cn("text-sm font-semibold", dueIsPositive ? "text-rose-600" : "text-emerald-600")}>
                    {formatMoney(order.due)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meta */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Order Info</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-2">
            <KeyValue icon={<CreditCard className="h-4 w-4" />} label="Payment type" value={<span className="capitalize">{order.paymentType}</span>} />
            <KeyValue icon={<Calendar className="h-4 w-4" />} label="Created" value={formatDateTime(order.createdAt)} />

            {order.trackingCode ? (
              <KeyValue
                icon={<Hash className="h-4 w-4" />}
                label="Tracking code"
                value={order.trackingCode}
                mono
                className="sm:col-span-2"
              />
            ) : null}

            {order.remark ? (
              <div className="sm:col-span-2">
                <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <StickyNote className="h-4 w-4" />
                  Remark
                </div>
                <div className="rounded-xl border bg-accent/30 p-3 text-sm leading-relaxed">
                  {order.remark}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
