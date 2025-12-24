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
  Plus,
  Trash2,
  Search,
  Package,
  DollarSign,
  User,
  ShoppingCart,
  X,
  Minus,
  Clock,
  CalendarDays,
  Receipt,
  Warehouse,
} from "lucide-react"
import { toast } from "sonner"
import { OrderFormData } from "@/types/order"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useProducts } from "@/hooks/products"
import { useWarehouses } from "@/hooks/warehouses"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface OrderFormProps {
  onSuccess: () => void
}

interface OrderProductItem {
  _id: string
  productId: string
  productTitle: string
  productSlug: string
  thumbnail?: string
  variantName: string | null
  warehouseId: string | null
  warehouseName: string | null
  price: number
  salePrice?: number
  quantity: number
  lineTotal: number
}

function formatMoney(amount: number) {
  return `৳${amount.toFixed(2)}`
}

export function OrderForm({ onSuccess }: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderProducts, setOrderProducts] = useState<OrderProductItem[]>([])
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 16))
  const [searchQuery, setSearchQuery] = useState("")
  const [showProductSearch, setShowProductSearch] = useState(false)

  const { data: productsData } = useProducts({ limit: 100, search: searchQuery })
  const { data: warehousesData } = useWarehouses({ limit: 100 })

  const products = productsData?.data || []
  const warehouses = warehousesData?.data || []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<OrderFormData>({
    defaultValues: {
      order_code: `ORD-${Date.now()}`,
      order_date: new Date().toISOString(),
      order_status: "pending",
      order_payment_status: "unpaid",
      discount_amount: 0,
      delivery_cost: 0,
      paid_amount: 0,
    },
  })

  const watchDiscountAmount = watch("discount_amount", 0)
  const watchDeliveryCost = watch("delivery_cost", 0)
  const watchPaidAmount = watch("paid_amount", 0)

  const subTotal = useMemo(
    () => orderProducts.reduce((sum, product) => sum + product.lineTotal, 0),
    [orderProducts]
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

  const addProductToOrder = (
    product: (typeof products)[0],
    variantName: string | null,
    warehouseId: string | null
  ) => {
    let warehouseName: string | null = null

    if (warehouseId) {
      const warehouse = warehouses.find((w: { _id: string; title: string }) => w._id === warehouseId)
      if (!warehouse) {
        toast.error("Please select a valid warehouse")
        return
      }
      warehouseName = warehouse.title
    }

    const variant = variantName
      ? product.variants.find(
          (v: { name: string; price: number; salePrice?: number }) => v.name === variantName
        )
      : null

    const price = variant?.price || product.price
    const salePrice = variant?.salePrice || product.salePrice
    const effectivePrice = salePrice || price

    const newProduct: OrderProductItem = {
      _id: `temp-${Date.now()}`,
      productId: product._id,
      productTitle: product.title,
      productSlug: product.slug,
      thumbnail: product.thumbnail,
      variantName,
      warehouseId: warehouseId,
      warehouseName,
      price,
      salePrice,
      quantity: 1,
      lineTotal: effectivePrice,
    }

    setOrderProducts((prev) => [...prev, newProduct])
    setShowProductSearch(false)
    setSearchQuery("")
    toast.success("Product added to order")
  }

  const removeProduct = (index: number) => {
    setOrderProducts((prev) => prev.filter((_, i) => i !== index))
  }

  const updateProductQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return
    setOrderProducts((prev) => {
      const updated = [...prev]
      const product = updated[index]
      const effectivePrice = product.salePrice || product.price
      updated[index] = { ...product, quantity, lineTotal: effectivePrice * quantity }
      return updated
    })
  }

  const onSubmit = async (data: OrderFormData) => {
    if (orderProducts.length === 0) {
      toast.error("Please add at least one product")
      return
    }

    setIsSubmitting(true)

    const productsWithWarehouse = orderProducts.map((p) => ({
      _id: p.productId,
      slug: p.productSlug,
      title: p.productTitle,
      thumbnail: p.thumbnail,
      basePrice: p.price,
      price: p.salePrice || p.price,
      quantity: p.quantity,
      variantName: p.variantName,
      variantPrice: p.variantName ? p.price : null,
      variantSalePrice: p.variantName ? p.salePrice : null,
      warehouseId: p.warehouseId,
      lineTotal: p.lineTotal,
    }))

    const orderData = {
      customerName: data.name,
      customerMobile: data.contact_number,
      customerEmail: data.email,
      customerAddress: data.address,
      customerDistrict: data.city,
      code: data.order_code,
      products: productsWithWarehouse,
      subTotal,
      total: orderAmount,
      discount: watchDiscountAmount || 0,
      deliveryCost: watchDeliveryCost || 0,
      paid: watchPaidAmount || 0,
      due: dueAmount,
      paymentStatus: data.order_payment_status,
      status: data.order_status,
      remark: data.remark,
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Failed to create order")

      toast.success("Order created successfully")
      onSuccess()
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "message" in error && typeof (error as any).message === "string"
          ? (error as any).message
          : "Failed to create order"
      toast.error(errorMessage)
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto px-3 sm:px-5">
      <SheetHeader className="mb-5 pt-2">
        <SheetTitle className="flex items-center gap-2 text-xl">
          <ShoppingCart className="h-5 w-5" />
          Create New Order
        </SheetTitle>
      </SheetHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Customer */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Input
                  id="address"
                  {...register("address", { required: "Address is required" })}
                  placeholder="Delivery address"
                  className={cn("h-10", errors.address && "border-red-500")}
                />
                {errors.address && (
                  <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>
                )}
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
              <div>
                <Label htmlFor="order_code" className="text-sm">
                  Order Code
                </Label>
                <Input
                  id="order_code"
                  {...register("order_code")}
                  readOnly
                  className="h-10 bg-muted font-mono text-xs"
                />
              </div>

              <div>
                <Label htmlFor="order_date" className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Order Date & Time
                </Label>
                <Input
                  id="order_date"
                  type="datetime-local"
                  value={orderDate}
                  className="h-10"
                  onChange={(e) => {
                    setOrderDate(e.target.value)
                    setValue("order_date", new Date(e.target.value).toISOString())
                  }}
                />
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

              <div>
                <Label htmlFor="remark" className="text-sm">
                  Additional Notes
                </Label>
                <Textarea
                  id="remark"
                  {...register("remark")}
                  placeholder="Any additional notes or special instructions..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="rounded-2xl border bg-accent/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Estimated Total
                  </div>
                  <div className="text-sm font-semibold">{formatMoney(orderAmount)}</div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Updates automatically with products, discount, delivery, and paid.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <CardTitle className="text-base">Products</CardTitle>
                <Badge variant="secondary" className="ml-1">
                  {orderProducts.length}
                </Badge>
              </div>

              <Button
                type="button"
                onClick={() => setShowProductSearch(true)}
                size="sm"
                variant="outline"
                className="h-9"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {orderProducts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No products added yet</p>
                <p className="text-xs mt-1">Click “Add Product” to start</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderProducts.map((product, index) => (
                  <div
                    key={product._id}
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

                    <div className="flex gap-3">
                      {product.thumbnail ? (
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted shrink-0">
                          <img
                            src={product.thumbnail}
                            alt={product.productTitle}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-sm truncate max-w-[60vw] sm:max-w-none">
                            {product.productTitle}
                          </h4>
                          {product.variantName ? (
                            <Badge variant="secondary" className="text-xs">
                              {product.variantName}
                            </Badge>
                          ) : null}
                          {product.warehouseName ? (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Warehouse className="h-3 w-3" />
                              {product.warehouseName}
                            </Badge>
                          ) : null}
                        </div>

                        <div className="mt-1 text-xs text-muted-foreground">
                          Each: {formatMoney(product.salePrice || product.price)}
                        </div>

                        <Separator className="my-3" />

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-xl"
                              onClick={() => updateProductQuantity(index, product.quantity - 1)}
                              disabled={product.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>

                            <div className="w-10 text-center text-sm font-semibold">
                              {product.quantity}
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-xl"
                              onClick={() => updateProductQuantity(index, product.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Line total</p>
                            <p className="text-sm font-bold">{formatMoney(product.lineTotal)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
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
                <div className="text-sm font-semibold">
                  {formatMoney(subTotal)}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({orderProducts.length} items)
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="discount_amount" className="text-sm">
                  Discount (৳)
                </Label>
                <Input
                  id="discount_amount"
                  type="number"
                  {...register("discount_amount", { valueAsNumber: true })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="h-10"
                />
              </div>

              <div>
                <Label htmlFor="delivery_cost" className="text-sm">
                  Delivery (৳)
                </Label>
                <Input
                  id="delivery_cost"
                  type="number"
                  {...register("delivery_cost", { valueAsNumber: true })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="h-10"
                />
              </div>
            </div>

            <div className="rounded-2xl border bg-primary/10 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Receipt className="h-4 w-4 text-primary" />
                  Order Total
                </div>
                <div className="text-lg font-bold text-primary">{formatMoney(orderAmount)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="paid_amount" className="text-sm">
                  Paid Amount (৳)
                </Label>
                <Input
                  id="paid_amount"
                  type="number"
                  {...register("paid_amount", { valueAsNumber: true })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="h-10"
                />
              </div>

              <div>
                <Label className="text-sm">Due Amount</Label>
                <div
                  className={cn(
                    "h-10 rounded-md border bg-muted px-3 flex items-center font-semibold",
                    dueAmount > 0
                      ? "text-destructive"
                      : dueAmount === 0
                        ? "text-emerald-600"
                        : "text-blue-600"
                  )}
                >
                  {formatMoney(dueAmount)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sticky CTA */}
        <div className="sticky bottom-0 -mx-3 sm:-mx-5 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-3 sm:px-5 py-3">
            <Button
              type="submit"
              disabled={isSubmitting || orderProducts.length === 0}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                "Creating Order..."
              ) : (
                <span className="inline-flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Create Order
                </span>
              )}
            </Button>
          </div>
        </div>
      </form>

      {showProductSearch && (
        <ProductSearchDialog
          products={products}
          warehouses={warehouses}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddProduct={addProductToOrder}
          onClose={() => {
            setShowProductSearch(false)
            setSearchQuery("")
          }}
        />
      )}
    </div>
  )
}

/* ------------------------------ */
/* Product Search Dialog */
/* ------------------------------ */

interface ProductSearchDialogProps {
  products: Array<{
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
  }>
  warehouses: Array<{
    _id: string
    title: string
  }>
  searchQuery: string
  setSearchQuery: (query: string) => void
  onAddProduct: (
    product: ProductSearchDialogProps["products"][0],
    variantName: string | null,
    warehouseId: string | null
  ) => void
  onClose: () => void
}

function ProductSearchDialog({
  products,
  warehouses,
  searchQuery,
  setSearchQuery,
  onAddProduct,
  onClose,
}: ProductSearchDialogProps) {
  const [selectedProduct, setSelectedProduct] =
    useState<ProductSearchDialogProps["products"][0] | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("")

  const selectedVariantObj = useMemo(() => {
    if (!selectedProduct || !selectedVariant) return null
    return selectedProduct.variants.find((v) => v.name === selectedVariant) || null
  }, [selectedProduct, selectedVariant])

  const previewPrice = useMemo(() => {
    if (!selectedProduct) return null
    if (!selectedVariantObj) return selectedProduct.salePrice || selectedProduct.price
    return selectedVariantObj.salePrice || selectedVariantObj.price
  }, [selectedProduct, selectedVariantObj])

  const handleAdd = () => {
    if (!selectedProduct) {
      toast.error("Please select a product")
      return
    }
    onAddProduct(selectedProduct, selectedVariant, selectedWarehouse || null)
    setSelectedProduct(null)
    setSelectedVariant(null)
    setSelectedWarehouse("")
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-2xl">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4" />
              Add Product
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-9 h-10"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Select Product</Label>
            <div className="rounded-2xl border overflow-hidden max-h-[42vh] overflow-y-auto">
              {products.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No products found</div>
              ) : (
                products.map((product) => {
                  const selected = selectedProduct?._id === product._id
                  const displayPrice = product.salePrice || product.price
                  return (
                    <button
                      type="button"
                      key={product._id}
                      className={cn(
                        "w-full text-left p-3 transition flex gap-3 items-center border-b last:border-b-0",
                        selected ? "bg-accent" : "hover:bg-accent/60"
                      )}
                      onClick={() => {
                        setSelectedProduct(product)
                        setSelectedVariant(null)
                      }}
                    >
                      {product.thumbnail ? (
                        <div className="h-10 w-10 rounded-xl overflow-hidden bg-muted shrink-0">
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-sm truncate">{product.title}</div>
                          {product.variants?.length ? (
                            <Badge variant="outline" className="text-xs shrink-0">
                              {product.variants.length} variants
                            </Badge>
                          ) : null}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-primary">{formatMoney(displayPrice)}</span>
                          <Badge variant="secondary" className="text-xs">
                            Stock: {product.quantity || 0}
                          </Badge>
                          {selected ? <Badge className="text-xs">Selected</Badge> : null}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {selectedProduct && selectedProduct.variants?.length > 0 && (
            <div className="space-y-2">
              <Label>Select Variant (Optional)</Label>
              <Select
                value={selectedVariant || "base"}
                onValueChange={(value) => setSelectedVariant(value === "base" ? null : value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base">
                    Base Product - {formatMoney(selectedProduct.salePrice || selectedProduct.price)}
                  </SelectItem>
                  {selectedProduct.variants.map((variant) => (
                    <SelectItem key={variant.name} value={variant.name}>
                      {variant.name} - {formatMoney(variant.salePrice || variant.price)}
                      {variant.quantity !== undefined ? (
                        <span className="text-xs text-muted-foreground ml-1">
                          (Stock: {variant.quantity})
                        </span>
                      ) : null}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Select Warehouse (Optional)</Label>
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Choose warehouse (optional)" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse._id} value={warehouse._id}>
                    {warehouse.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && (
            <div className="rounded-2xl border bg-accent/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Preview</div>
                  <div className="text-sm font-semibold truncate">{selectedProduct.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {selectedVariant ? (
                      <Badge variant="secondary" className="text-xs">
                        {selectedVariant}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Base
                      </Badge>
                    )}
                    {selectedWarehouse ? (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Warehouse className="h-3 w-3" />
                        {warehouses.find((w) => w._id === selectedWarehouse)?.title}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-muted-foreground">Price</div>
                  <div className="text-sm font-bold text-primary">
                    {previewPrice === null ? "—" : formatMoney(previewPrice)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <div className="p-3 border-t flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedProduct} className="flex-1">
            Add to Order
          </Button>
        </div>
      </Card>
    </div>
  )
}
