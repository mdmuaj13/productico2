"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Order } from "@/hooks/orders"
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
} from "lucide-react"

interface OrderViewProps {
  order: Order
  onEdit: () => void
  onSuccess: () => void
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function formatMoney(amount: number) {
  // You can swap to Intl.NumberFormat if you want commas
  return `৳${amount.toFixed(2)}`
}

function formatDateTime(input: string | number | Date) {
  try {
    return new Date(input).toLocaleString()
  } catch {
    return String(input)
  }
}

function statusLabel(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

function statusBadgeVariant(status: Order["status"]) {
  // Keep variants within shadcn badge variants you already use: default/secondary/destructive
  switch (status) {
    case "cancelled":
      return "destructive"
    case "pending":
      return "secondary"
    case "processing":
    case "confirmed":
    case "shipped":
    case "delivered":
    default:
      return "default"
  }
}

function paymentBadgeVariant(status: Order["paymentStatus"]) {
  switch (status) {
    case "unpaid":
      return "destructive"
    case "partial":
      return "secondary"
    case "paid":
    default:
      return "default"
  }
}

function KeyValue({
  icon,
  label,
  value,
  className,
  mono,
}: {
  icon?: React.ReactNode
  label: string
  value: React.ReactNode
  className?: string
  mono?: boolean
}) {
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border bg-card p-3", className)}>
      <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className={cn("text-sm font-medium break-words", mono && "font-mono")}>{value}</div>
      </div>
    </div>
  )
}

export function OrderView({ order, onEdit }: OrderViewProps) {
  const dueIsPositive = order.due > 0

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

          <Button onClick={onEdit} size="sm" variant="outline" className="shrink-0">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
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
            <KeyValue
              icon={<User className="h-4 w-4" />}
              label="Name"
              value={order.customerName}
            />
            <KeyValue
              icon={<Phone className="h-4 w-4" />}
              label="Contact"
              value={order.customerMobile}
              mono
            />
            {order.customerEmail ? (
              <KeyValue
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={order.customerEmail}
              />
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
              <div
                key={index}
                className={cn(
                  "rounded-xl border bg-card p-3",
                  index !== order.products.length - 1 && "after:content-['']"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight wrap-break-word">
                      {product.title}
                    </p>
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
                  <span className="font-medium text-emerald-600">
                    -{formatMoney(order.discount)}
                  </span>
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
                  <span className="text-base font-bold text-primary">
                    {formatMoney(order.total)}
                  </span>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Paid</p>
                  <p className="text-sm font-semibold text-emerald-600">{formatMoney(order.paid)}</p>
                </div>

                <div className="rounded-xl border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Due</p>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      dueIsPositive ? "text-rose-600" : "text-emerald-600"
                    )}
                  >
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
            <KeyValue
              icon={<CreditCard className="h-4 w-4" />}
              label="Payment type"
              value={<span className="capitalize">{order.paymentType}</span>}
            />
            <KeyValue
              icon={<Calendar className="h-4 w-4" />}
              label="Created"
              value={formatDateTime(order.createdAt)}
            />

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
  )
}
