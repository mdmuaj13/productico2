"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Trash2,
  User,
  ShoppingCart,
  DollarSign,
  Package,
  Minus,
  Plus,
  FileText,
  Calendar,
  BadgeCheck,
  CreditCard,
  Receipt,
  Search,
  Warehouse as WarehouseIcon,
  Layers3,
  Tag,
} from "lucide-react"
import { toast } from "sonner"
import { OrderFormData } from "@/types/order"
import { Order as APIOrder, updateOrder } from "@/hooks/orders"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { useProducts } from "@/hooks/products"
import { useWarehouses } from "@/hooks/warehouses"

interface OrderEditFormProps {
  order: APIOrder
  onSuccess: () => void
}

function formatMoney(amount: number) {
  return `৳${amount.toFixed(2)}`
}

type ProductItem = {
  _id: string
  title: string
  slug: string
  thumbnail?: string
  price: number
  salePrice?: number
  quantity?: number
  variants: Array<{
    name: string
    price: number
    salePrice?: number
    quantity?: number
  }>
}

type WarehouseItem = {
  _id: string
  title: string
}

type OrderProductItem = {
  id: string
  title: string
  slug: string // ✅ not optional
  thumbnail?: string
  price: number
  salePrice?: number
  quantity: number
  lineTotal: number
  variantName: string | null
  warehouseId: string | null
}

export function OrderEditForm({ order, onSuccess }: OrderEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch catalog products + warehouses (for search panel)
  const [searchQuery, setSearchQuery] = useState("")
  const { data: productsData } = useProducts({ limit: 100, search: searchQuery })
  const { data: warehousesData } = useWarehouses({ limit: 100 })

  const catalogProducts: ProductItem[] = productsData?.data || []
  const warehouses: WarehouseItem[] = warehousesData?.data || []

  // ✅ Fix TS issue: ensure slug is always string (fallback to empty string)
  const mappedProducts: OrderProductItem[] = useMemo(
    () =>
      order.products.map((p) => ({
        id: p._id,
        title: p.title ?? "",
        slug: p.slug ?? "", // ✅ FIX: never undefined
        thumbnail: p.thumbnail,
        price: ((p as any).basePrice ?? p.price ?? 0) as number, // ✅ ensure number
        salePrice: p.variantSalePrice || undefined,
        quantity: p.quantity ?? 1,
        lineTotal: p.lineTotal ?? 0,
        variantName: p.variantName ?? null,
        warehouseId: p.warehouseId ?? null,
      })),
    [order.products]
  )

  const [products, setProducts] = useState<OrderProductItem[]>(mappedProducts)

  const initialDate = useMemo(() => {
    const d = order.createdAt ? new Date(order.createdAt) : new Date()
    return d.toISOString().split("T")[0]
  }, [order.createdAt])

  const [orderDate, setOrderDate] = useState(initialDate)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<OrderFormData>({
    defaultValues: {
      name: order.customerName,
      contact_number: order.customerMobile,
      email: order.customerEmail,
      address: order.customerAddress,
      city: order.customerDistrict || "",
      order_code: order.code,
      order_date: order.createdAt,
      order_status: order.status as any,
      order_payment_status: order.paymentStatus as any,
      discount_code: "",
      discount_amount: order.discount,
      delivery_cost: order.deliveryCost,
      paid_amount: order.paid,
      remark: order.remark,
    },
  })

  const watchDiscountAmount = watch("discount_amount", 0)
  const watchDeliveryCost = watch("delivery_cost", 0)
  const watchPaidAmount = watch("paid_amount", 0)

  const subTotal = useMemo(
    () => products.reduce((sum, product) => sum + product.lineTotal, 0),
    [products]
  )

  const orderAmount = useMemo(
    () => subTotal - (watchDiscountAmount || 0) + (watchDeliveryCost || 0),
    [subTotal, watchDiscountAmount, watchDeliveryCost]
  )

  const dueAmount = useMemo(
    () => orderAmount - (watchPaidAmount || 0),
    [orderAmount, watchPaidAmount]
  )

  useEffect(() => {
    setValue("order_amount", orderAmount)
    setValue("due_amount", dueAmount)
  }, [orderAmount, dueAmount, setValue])

  const recalcLineTotal = (p: OrderProductItem) => {
    const effective = typeof p.salePrice === "number" && p.salePrice > 0 ? p.salePrice : p.price
    return (effective || 0) * (p.quantity || 0)
  }

  const updateProduct = (index: number, patch: Partial<OrderProductItem>) => {
    setProducts((prev) => {
      const next = [...prev]
      const current = next[index]
      if (!current) return prev
      const merged: OrderProductItem = { ...current, ...patch }
      merged.lineTotal = recalcLineTotal(merged)
      next[index] = merged
      return next
    })
  }

  const removeProduct = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index))
  }

  const updateQuantity = (index: number, delta: number) => {
    const curr = products[index]
    const nextQty = Math.max(1, (curr?.quantity || 1) + delta)
    updateProduct(index, { quantity: nextQty })
  }

  // Add from catalog (variant + warehouse recorded, but NOT shown in order list UI)
  const addProductFromCatalog = (product: ProductItem, warehouseId: string | null, variantName: string | null) => {
    const variant = variantName ? product.variants?.find((v) => v.name === variantName) ?? null : null

    const basePrice = variant?.price ?? product.price
    const salePrice = variant?.salePrice ?? product.salePrice
    const effective = salePrice ?? basePrice

    const newProduct: OrderProductItem = {
      id: `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: product.title,
      slug: product.slug ?? "", // ✅ FIX: keep string
      thumbnail: product.thumbnail,
      price: basePrice,
      salePrice: salePrice ?? undefined,
      quantity: 1,
      lineTotal: effective,
      variantName,
      warehouseId,
    }

    setProducts((prev) => [...prev, newProduct])
    toast.success("Added to order")
  }

  const onSubmit = async (data: OrderFormData) => {
    if (products.length === 0) {
      toast.error("Please add at least one product")
      return
    }

    const invalidProduct = products.find((p) => !p.title || p.price <= 0 || p.quantity <= 0)
    if (invalidProduct) {
      toast.error("Please fill in all product details")
      return
    }

    setIsSubmitting(true)

    const apiData = {
      customerName: data.name,
      customerMobile: data.contact_number,
      customerEmail: data.email,
      customerAddress: data.address,
      customerDistrict: data.city,
      code: data.order_code,
      products: products.map((p) => ({
        _id: p.id,
        title: p.title,
        slug: p.slug || "",
        thumbnail: p.thumbnail,
        basePrice: p.price,
        price: typeof p.salePrice === "number" && p.salePrice > 0 ? p.salePrice : p.price,
        quantity: p.quantity,
        lineTotal: p.lineTotal,
        variantName: p.variantName ?? null,
        variantPrice: p.variantName ? p.price : null,
        variantSalePrice: typeof p.salePrice === "number" && p.salePrice > 0 ? p.salePrice : null,
        warehouseId: p.warehouseId ?? null,
      })),
      discount: data.discount_amount || 0,
      deliveryCost: data.delivery_cost || 0,
      paid: data.paid_amount || 0,
      status: data.order_status,
      paymentStatus: data.order_payment_status,
      remark: data.remark,
      tax: 0,
      paymentType: "cash" as const,
    }

    try {
      await updateOrder(order._id, apiData)
      toast.success("Order updated successfully")
      onSuccess()
    } catch (error) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as any).message === "string"
          ? (error as any).message
          : "Failed to update order"
      toast.error(errorMessage)
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto px-3 sm:px-5">
      <SheetHeader className="mb-5 pt-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <ShoppingCart className="h-5 w-5" />
              Edit Order
            </SheetTitle>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                {order.code}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(order.createdAt).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </div>
      </SheetHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Customer */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-sm">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name", { required: "Name is required" })}
                    placeholder="Customer name"
                    className={cn("h-10", errors.name && "border-red-500")}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="contact_number" className="text-sm">
                      Contact <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact_number"
                      {...register("contact_number", { required: "Contact is required" })}
                      placeholder="Phone number"
                      className={cn("h-10", errors.contact_number && "border-red-500")}
                    />
                    {errors.contact_number && (
                      <p className="text-xs text-red-500 mt-1">{errors.contact_number.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="customer@example.com"
                      className="h-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    {...register("address", { required: "Address is required" })}
                    placeholder="Delivery address"
                    rows={3}
                    className={cn("min-h-[90px] resize-none", errors.address && "border-red-500")}
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
                </div>

                <div>
                  <Label htmlFor="city" className="text-sm">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    {...register("city", { required: "City is required" })}
                    placeholder="City"
                    className={cn("h-10", errors.city && "border-red-500")}
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Details
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="order_code" className="text-sm">
                    Order Code
                  </Label>
                  <Input id="order_code" {...register("order_code")} readOnly className="h-10 bg-muted font-mono" />
                </div>

                <div>
                  <Label htmlFor="order_date" className="text-sm">
                    Order Date
                  </Label>
                  <Input
                    id="order_date"
                    type="date"
                    value={orderDate}
                    className="h-10"
                    onChange={(e) => {
                      setOrderDate(e.target.value)
                      setValue("order_date", new Date(e.target.value).toISOString())
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Order Status</Label>
                  <Controller
                    name="order_status"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <Label className="text-sm">Payment Status</Label>
                  <Controller
                    name="order_payment_status"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
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

              <div className="rounded-xl border bg-accent/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    Current Total
                  </div>
                  <div className="text-sm font-semibold">{formatMoney(orderAmount)}</div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Due updates automatically when you change paid/discount/delivery.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ Products */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <CardTitle className="text-base">Products</CardTitle>
                <Badge variant="secondary" className="ml-1">
                  {products.length} {products.length === 1 ? "item" : "items"}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ProductSearchPanel
                products={catalogProducts}
                warehouses={warehouses}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onPick={(product, warehouseId, variantName) => addProductFromCatalog(product, warehouseId, variantName)}
              />

              <div className="space-y-3">
                {products.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground rounded-2xl border">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No products added yet</p>
                    <p className="text-xs mt-1">Click a product on the left to add items</p>
                  </div>
                ) : (
                  products.map((product, index) => (
                    <div
                      key={product.id}
                      className="relative rounded-2xl border bg-card p-4 transition hover:bg-accent/5"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-9 w-9"
                        onClick={() => removeProduct(index)}
                        aria-label="Remove product"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>

                      <div className="space-y-4 pr-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2">
                            <Label className="text-xs">Product Title *</Label>
                            <Input
                              value={product.title}
                              onChange={(e) => updateProduct(index, { title: e.target.value })}
                              placeholder="Product name"
                              className="h-10"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Price *</Label>
                            <Input
                              type="number"
                              value={product.price}
                              onChange={(e) => updateProduct(index, { price: parseFloat(e.target.value) || 0 })}
                              placeholder="0.00"
                              step="0.01"
                              className="h-10"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Sale Price</Label>
                            <Input
                              type="number"
                              value={product.salePrice ?? ""}
                              onChange={(e) => {
                                const raw = e.target.value
                                updateProduct(index, { salePrice: raw === "" ? undefined : parseFloat(raw) || 0 })
                              }}
                              placeholder="0.00"
                              step="0.01"
                              className="h-10"
                            />
                            <p className="mt-1 text-[11px] text-muted-foreground">Leave empty to use base price.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Quantity *</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-10 rounded-xl"
                                onClick={() => updateQuantity(index, -1)}
                                disabled={product.quantity <= 1}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </Button>

                              <Input
                                type="number"
                                value={product.quantity}
                                onChange={(e) => updateProduct(index, { quantity: parseInt(e.target.value) || 1 })}
                                min="1"
                                className="h-8 text-center"
                              />

                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-10 rounded-xl"
                                onClick={() => updateQuantity(index, 1)}
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">Line Total</Label>
                            <Input
                              value={formatMoney(product.lineTotal)}
                              readOnly
                              className="h-8 text-sm bg-muted font-semibold"
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="rounded-xl bg-accent/30 px-2 py-1">
                            <p className="text-muted-foreground">Price</p>
                            <p className="text-sm font-semibold">
                              {formatMoney(
                                typeof product.salePrice === "number" && product.salePrice > 0 ? product.salePrice : product.price
                              )}
                            </p>
                          </div>
                          <div className="rounded-xl bg-accent/30 px-2 py-1">
                            <p className="text-muted-foreground">Qty</p>
                            <p className="text-sm font-semibold">{product.quantity}</p>
                          </div>
                          <div className="rounded-xl bg-accent/30 px-2 py-1">
                            <p className="text-muted-foreground">Total</p>
                            <p className="text-sm font-semibold">{formatMoney(product.lineTotal)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Financial Summary
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-2xl border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4" />
                  Subtotal
                </div>
                <div className="text-sm font-semibold">{formatMoney(subTotal)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="discount_amount" className="text-sm">
                  Discount
                </Label>
                <Input
                  id="discount_amount"
                  type="number"
                  {...register("discount_amount", { valueAsNumber: true })}
                  placeholder="0.00"
                  step="0.01"
                  className="h-10"
                />
              </div>

              <div>
                <Label htmlFor="delivery_cost" className="text-sm">
                  Delivery Cost
                </Label>
                <Input
                  id="delivery_cost"
                  type="number"
                  {...register("delivery_cost", { valueAsNumber: true })}
                  placeholder="0.00"
                  step="0.01"
                  className="h-10"
                />
              </div>
            </div>

            <div className="rounded-2xl border bg-primary/10 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Total Amount
                </div>
                <div className="text-lg font-bold text-primary">{formatMoney(orderAmount)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="paid_amount" className="text-sm">
                  Paid Amount
                </Label>
                <Input
                  id="paid_amount"
                  type="number"
                  {...register("paid_amount", { valueAsNumber: true })}
                  placeholder="0.00"
                  step="0.01"
                  className="h-10"
                />
              </div>

              <div>
                <Label className="text-sm">Due Amount</Label>
                <Input
                  value={formatMoney(dueAmount)}
                  readOnly
                  className={cn(
                    "h-10 bg-muted font-semibold",
                    dueAmount > 0 ? "text-destructive" : "text-emerald-600"
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Additional Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="remark" className="text-sm">
              Remark
            </Label>
            <Textarea
              id="remark"
              {...register("remark")}
              placeholder="Any additional notes about this order..."
              rows={3}
              className="resize-none"
            />
          </CardContent>
        </Card>

        {/* Sticky action bar */}
        <div className="sticky bottom-0 -mx-3 sm:-mx-5 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-3 sm:px-5 py-3">
            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? "Updating Order..." : "Update Order"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

/** LEFT: product list scrollable + limited height + bottom controls for Variant + Warehouse */
function ProductSearchPanel({
  products,
  warehouses,
  searchQuery,
  setSearchQuery,
  onPick,
}: {
  products: ProductItem[]
  warehouses: WarehouseItem[]
  searchQuery: string
  setSearchQuery: (v: string) => void
  onPick: (product: ProductItem, warehouseId: string | null, variantName: string | null) => void
}) {
  const NONE_WAREHOUSE = "__none__"
  const BASE_VARIANT = "__base__"

  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(NONE_WAREHOUSE)
  const [selectedVariant, setSelectedVariant] = useState<string>(BASE_VARIANT)
  const [activeProduct, setActiveProduct] = useState<ProductItem | null>(null)

  const variantOptions = useMemo(() => {
    if (!activeProduct) return []
    return (activeProduct.variants || []).map((v) => v.name)
  }, [activeProduct])

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Search className="h-4 w-4" />
          Add Products
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 space-y-3 flex-1 flex flex-col">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
          />
        </div>

        {/* ✅ Scrollable list with limited height */}
        <div className="border rounded-xl divide-y overflow-y-auto max-h-[420px]">
          {products.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No products found</div>
          ) : (
            products.map((p) => (
              <button
                key={p._id}
                type="button"
                onMouseEnter={() => {
                  setActiveProduct(p)
                  if (selectedVariant !== BASE_VARIANT && !p.variants?.some((v) => v.name === selectedVariant)) {
                    setSelectedVariant(BASE_VARIANT)
                  }
                }}
                onClick={() => {
                  const warehouseId = selectedWarehouse === NONE_WAREHOUSE ? null : selectedWarehouse
                  const variantName = selectedVariant === BASE_VARIANT ? null : selectedVariant
                  onPick(p, warehouseId, variantName)
                }}
                className="w-full text-left p-3 hover:bg-accent transition-colors flex gap-2"
              >
                {p.thumbnail && (
                  <div className="bg-gray-100 rounded-lg p-1 flex-shrink-0">
                    <img src={p.thumbnail} alt={p.title} className="w-10 h-10 object-cover rounded-md" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium text-sm truncate">{p.title}</h4>
                    <span className="text-sm font-semibold text-primary whitespace-nowrap">
                      ৳{p.salePrice || p.price}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {p.variants?.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {p.variants.length} variants
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      Stock: {p.quantity || 0}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-1">Click to add</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Bottom controls */}
        <div className="pt-3 border-t space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-2">
                <Layers3 className="h-3.5 w-3.5" />
                Variant (optional)
              </Label>

              <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                <SelectTrigger className="h-11 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-muted-foreground">
                      <Tag className="h-4 w-4" />
                    </span>
                    <SelectValue placeholder="Base product" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BASE_VARIANT}>Base product</SelectItem>
                  {variantOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="text-[11px] text-muted-foreground">Hover a product to load its variants here.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-2">
                <WarehouseIcon className="h-3.5 w-3.5" />
                Warehouse (optional)
              </Label>

              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger className="h-11 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-muted-foreground">
                      <WarehouseIcon className="h-4 w-4" />
                    </span>
                    <SelectValue placeholder="No warehouse" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_WAREHOUSE}>No warehouse</SelectItem>
                  {warehouses.map((w) => (
                    <SelectItem key={w._id} value={w._id}>
                      {w.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
