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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import {
  Package,
  DollarSign,
  User,
  ShoppingCart,
  Trash2,
  Search,
  Clock,
  Warehouse as WarehouseIcon,
  Layers3,
  Plus,
  Check,
  ChevronsUpDown,
  Calendar,
} from "lucide-react";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { OrderFormData } from "@/types/order";
import { Order as APIOrder, updateOrder } from "@/hooks/orders";
import { useProducts } from "@/hooks/products";
import { useWarehouses } from "@/hooks/warehouses";

interface OrderEditFormProps {
  order: APIOrder;
  onSuccess: () => void;
}

type ProductItem = {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  price: number;
  salePrice?: number;
  quantity?: number;
  variants: Array<{
    name: string;
    price: number;
    salePrice?: number;
    quantity?: number;
  }>;
};

type WarehouseItem = {
  _id: string;
  title: string;
};

type LineItemUI = {
  id: string; // UI only key
  customObjectId?: string; // for custom item => valid ObjectId hex(24)

  productId: string | null;
  productSlug: string;
  thumbnail?: string;

  title: string;

  variantName: string | null;
  warehouseId: string | null;

  rate: number;
  quantity: number;
  amount: number;
};

type ProductOption = {
  _id: string;
  title: string;
  price: number;
  salePrice?: number;
};

const NONE = "__none__";

function uid() {
  return `${Date.now()}${Math.random().toString(16).slice(2)}`;
}

function formatMoney(amount: number) {
  return `৳${Number(amount || 0).toFixed(2)}`;
}

function getEffectivePrice(base: number, sale?: number) {
  return sale != null ? Number(sale) : Number(base || 0);
}

function makeObjectIdHex24() {
  const bytes = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes => 24 hex chars
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Searchable dropdown with custom entry (same as create)
 */
function SearchableProductWithCustom({
  options,
  value,
  onChange,
  placeholder = "Select product or type…",
  disabled,
}: {
  options: ProductOption[];
  value: string;
  onChange: (title: string, meta?: ProductOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) setQuery(value || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => (o.title || "").toLowerCase().includes(q));
  }, [options, query]);

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return options.find((o) => (o.title || "").toLowerCase() === q) || null;
  }, [options, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "h-10 w-full rounded-md border px-3 text-left text-sm flex items-center justify-between",
            "bg-background hover:bg-accent/30",
            disabled && "opacity-60 cursor-not-allowed"
          )}>
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value ? value : placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[420px] p-0 max-h-[360px] overflow-hidden"
        align="start"
        side="bottom"
        sideOffset={8}
        avoidCollisions={false}>
        <Command className="h-[360px]">
          <CommandInput
            placeholder="Search product…"
            value={query}
            onValueChange={setQuery}
          />

          <CommandEmpty className="py-3 text-center text-sm text-muted-foreground">
            No products found
          </CommandEmpty>

          <CommandGroup
            heading="Products"
            className="max-h-[240px] overflow-y-auto">
            {filtered.slice(0, 50).map((o) => (
              <CommandItem
                key={o._id}
                value={o.title}
                onSelect={() => {
                  onChange(o.title, o);
                  setOpen(false);
                }}
                className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="truncate">{o.title}</div>
                  <div className="text-xs text-muted-foreground">
                    ৳{getEffectivePrice(o.price, o.salePrice)}
                  </div>
                </div>
                {value === o.title ? (
                  <Check className="h-4 w-4 text-muted-foreground" />
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>

          <div className="border-t p-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-start"
              disabled={!query.trim() || !!exactMatch}
              onClick={() => {
                const title = query.trim();
                if (!title) return;
                onChange(title, null);
                setOpen(false);
              }}>
              <Plus className="h-4 w-4 mr-2" />
              Use “{query.trim() || "…"}” as new item
            </Button>

            {!!exactMatch ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Tip: exact match exists—select it from the list.
              </p>
            ) : null}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function OrderEditForm({ order, onSuccess }: OrderEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // fetch list (same style as create)
  const { data: productsData } = useProducts({ limit: 200, search: "" });
  const { data: warehousesData } = useWarehouses({ limit: 200 });

  const catalogProducts: ProductItem[] = productsData?.data || [];
  const warehouses: WarehouseItem[] = warehousesData?.data || [];

  const productOptions: ProductOption[] = useMemo(() => {
    return (catalogProducts || []).map((p) => ({
      _id: String(p._id),
      title: String(p.title ?? ""),
      price: typeof p.price === "number" ? p.price : Number(p.price || 0),
      salePrice: p.salePrice != null ? Number(p.salePrice) : undefined,
    }));
  }, [catalogProducts]);

  const findProduct = (id: string) =>
    catalogProducts.find((p) => String(p._id) === String(id)) || null;

  // Convert API order products -> LineItemUI (same model as create)
  const initialItems: LineItemUI[] = useMemo(() => {
    const list = (order.products || []).map((p: any) => {
      const productId = p?._id ? String(p._id) : null;

      const title = String(p?.title ?? "");
      const slug = String(p?.slug ?? "");
      const thumbnail = p?.thumbnail;

      const qty = Number(p?.quantity ?? 1);

      // Prefer stored price/rate (basePrice or price)
      const rate = Number(p?.basePrice ?? p?.price ?? 0);

      const amount = Math.max(qty * rate, 0);

      // if item is NOT a real product in catalog, treat it as custom
      const existsInCatalog = productId ? !!findProduct(productId) : false;

      return {
        id: uid(),
        customObjectId: existsInCatalog ? undefined : makeObjectIdHex24(),
        productId: existsInCatalog ? productId : null,
        productSlug: existsInCatalog ? slug : "",
        thumbnail: existsInCatalog ? thumbnail : undefined,

        title,

        variantName: existsInCatalog ? p?.variantName ?? null : null,
        warehouseId: existsInCatalog ? p?.warehouseId ?? null : null,

        quantity: qty,
        rate,
        amount,
      } satisfies LineItemUI;
    });

    return list.length
      ? list
      : [
          {
            id: uid(),
            productId: null,
            productSlug: "",
            thumbnail: undefined,
            title: "",
            variantName: null,
            warehouseId: null,
            quantity: 1,
            rate: 0,
            amount: 0,
            customObjectId: makeObjectIdHex24(),
          },
        ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.products, catalogProducts.length]);

  const [items, setItems] = useState<LineItemUI[]>(initialItems);

  // when order/catalog changes, refresh items once
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const itemsScrollRef = useRef<HTMLDivElement | null>(null);

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

      discount_amount: Number(order.discount || 0),
      delivery_cost: Number(order.deliveryCost || 0),
      paid_amount: Number(order.paid || 0),

      remark: order.remark,
    },
  });

  const watchDiscountAmount = Number(watch("discount_amount") || 0);
  const watchDeliveryCost = Number(watch("delivery_cost") || 0);
  const watchPaidAmount = Number(watch("paid_amount") || 0);

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
      {
        id: uid(),
        productId: null,
        productSlug: "",
        thumbnail: undefined,
        title: "",
        variantName: null,
        warehouseId: null,
        quantity: 1,
        rate: 0,
        amount: 0,
        customObjectId: makeObjectIdHex24(),
      },
    ]);

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const subTotal = useMemo(
    () => items.reduce((sum, it) => sum + Number(it.amount || 0), 0),
    [items]
  );

  const orderAmount = Math.max(
    subTotal - watchDiscountAmount + watchDeliveryCost,
    0
  );
  const dueAmount = Math.max(orderAmount - watchPaidAmount, 0);

  useEffect(() => {
    setValue("order_amount", orderAmount as any);
    setValue("due_amount", dueAmount as any);
  }, [orderAmount, dueAmount, setValue]);

  const validateItems = () => {
    if (items.length === 0) return "Please add at least one item.";
    const invalid = items.some(
      (it) =>
        !it.title.trim() || Number(it.quantity) <= 0 || Number(it.rate) < 0
    );
    if (invalid) return "Please fill item name and valid quantity/rate.";
    return null;
  };

  const handleProductChange = (
    rowId: string,
    title: string,
    meta?: ProductOption | null
  ) => {
    // Custom
    if (!meta?._id) {
      updateItem(rowId, {
        title,
        productId: null,
        productSlug: "",
        thumbnail: undefined,
        variantName: null,
        warehouseId: null,
        rate: 0,
        customObjectId: makeObjectIdHex24(),
      });
      return;
    }

    const product = findProduct(meta._id);
    const base = Number(meta.price || 0);
    const eff = getEffectivePrice(base, meta.salePrice);

    updateItem(rowId, {
      title,
      productId: meta._id,
      productSlug: product?.slug ?? "",
      thumbnail: product?.thumbnail,
      variantName: null,
      warehouseId: null,
      rate: eff,
      customObjectId: undefined,
    });
  };

  const handleVariantChange = (rowId: string, value: string) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        if (!row.productId) return row;

        const product = findProduct(row.productId);
        if (!product) return row;

        const variantName = value === "base" ? null : value;

        const variant =
          variantName && product.variants?.length
            ? product.variants.find((v) => v.name === variantName) || null
            : null;

        const basePrice = Number(variant?.price ?? product.price ?? 0);
        const salePrice =
          variant?.salePrice != null
            ? Number(variant.salePrice)
            : product.salePrice != null
            ? Number(product.salePrice)
            : undefined;

        const nextRate = getEffectivePrice(basePrice, salePrice);

        const next: LineItemUI = {
          ...row,
          variantName,
          rate: nextRate,
        };

        next.amount = Math.max(
          Number(next.quantity || 0) * Number(next.rate || 0),
          0
        );
        return next;
      })
    );
  };

  const onSubmit = async (data: OrderFormData) => {
    const itemError = validateItems();
    if (itemError) {
      toast.error(itemError);
      return;
    }

    setIsSubmitting(true);

    try {
      const productsPayload = items.map((it) => {
        // ✅ Mongoose expects ObjectId in _id always
        const mongoId = it.productId
          ? String(it.productId)
          : String(it.customObjectId || makeObjectIdHex24());

        return {
          _id: mongoId,
          slug: it.productSlug || "",
          title: String(it.title || ""),
          thumbnail: it.thumbnail,

          basePrice: Number(it.rate || 0),
          price: Number(it.rate || 0),
          quantity: Number(it.quantity || 1),

          variantName: it.productId ? it.variantName : null,
          variantPrice:
            it.productId && it.variantName ? Number(it.rate || 0) : null,
          variantSalePrice:
            it.productId && it.variantName ? Number(it.rate || 0) : null,

          warehouseId: it.productId ? it.warehouseId : null,
          lineTotal: Number(it.amount || 0),
        };
      });

      const apiData = {
        customerName: data.name,
        customerMobile: data.contact_number,
        customerEmail: data.email,
        customerAddress: data.address,
        customerDistrict: data.city,

        code: data.order_code,
        products: productsPayload,

        subTotal,
        total: orderAmount,
        discount: watchDiscountAmount || 0,
        deliveryCost: watchDeliveryCost || 0,
        paid: watchPaidAmount || 0,
        due: dueAmount,

        paymentStatus: data.order_payment_status,
        status: data.order_status,
        remark: data.remark,

        tax: 0,
        paymentType: "cash" as const,
      };

      await updateOrder(order._id, apiData);

      toast.success("Order updated successfully");
      onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update order";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="contact_number" className="text-sm">
                      Contact <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="contact_number"
                      {...register("contact_number", {
                        required: "Contact is required",
                      })}
                      placeholder="Phone number"
                      className={cn(
                        "h-10",
                        errors.contact_number && "border-red-500"
                      )}
                    />
                    {errors.contact_number && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.contact_number.message}
                      </p>
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
                    {...register("address", {
                      required: "Address is required",
                    })}
                    placeholder="Delivery address"
                    rows={3}
                    className={cn(
                      "min-h-[90px] resize-none",
                      errors.address && "border-red-500"
                    )}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.address.message}
                    </p>
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
                  {errors.city && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.city.message}
                    </p>
                  )}
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
                  <Input
                    id="order_code"
                    {...register("order_code")}
                    readOnly
                    className="h-10 bg-muted font-mono"
                  />
                </div>

                <div>
                  <Label className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Order Date
                  </Label>
                  <Input
                    type="text"
                    readOnly
                    value={new Date(order.createdAt).toLocaleString()}
                    className="h-10 bg-muted"
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
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
                  <div className="text-sm font-medium">Current Total</div>
                  <div className="text-sm font-semibold">
                    {formatMoney(orderAmount)}
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Due updates automatically when you change
                  paid/discount/delivery.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ Order Items (same UI style as create) */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Order items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add item
            </Button>
          </CardHeader>

          {/* fixed height + horizontal scroll + wheel => horizontal */}
          <CardContent className="space-y-3">
            {/* Header (desktop only) */}
            <div className="hidden lg:flex gap-2 text-xs text-muted-foreground px-1">
              <div className="flex-[2.2] flex items-center gap-2">
                <span>Product</span>
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <ChevronsUpDown className="h-3 w-3" /> searchable
                </span>
              </div>
              <div className="flex-1">Variant</div>
              <div className="flex-1">Warehouse</div>
              <div className="w-20 text-right">QTY</div>
              <div className="w-24 text-right">Rate</div>
              <div className="w-10" />
            </div>

            <div className="space-y-2">
              {items.map((it) => {
                const product = it.productId ? findProduct(it.productId) : null;
                const hasProduct = !!product;

                return (
                  <div
                    key={it.id}
                    className={cn(
                      "rounded-xl border p-2.5",
                      "hover:bg-accent/20 transition-colors"
                    )}>
                    {/* Row 1: controls */}
                    <div className="flex flex-col lg:flex-row gap-2">
                      {/* Product */}
                      <div className="flex-[2.2] min-w-0">
                        <Label className="lg:hidden text-xs text-muted-foreground mb-1 block">
                          Product
                        </Label>

                        <SearchableProductWithCustom
                          options={productOptions}
                          value={it.title}
                          onChange={(title, meta) =>
                            handleProductChange(it.id, title, meta)
                          }
                          placeholder="Select product or type…"
                        />

                        {/* small helper badges */}
                        <div className="mt-1 flex flex-wrap gap-2">
                          {hasProduct ? (
                            <>
                              <Badge
                                variant="secondary"
                                className="text-[11px]">
                                Unit: ৳{Math.round(it.rate)}
                              </Badge>
                              {product?.variants?.length ? (
                                <Badge
                                  variant="outline"
                                  className="text-[11px]">
                                  {product.variants.length} variants
                                </Badge>
                              ) : null}
                            </>
                          ) : it.title.trim() ? (
                            <Badge variant="outline" className="text-[11px]">
                              Custom item
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      {/* Variant */}
                      <div className="flex-1 min-w-[160px]">
                        <Label className="lg:hidden text-xs text-muted-foreground mb-1 block">
                          Variant
                        </Label>

                        <Select
                          value={it.variantName ? it.variantName : "base"}
                          onValueChange={(v) => handleVariantChange(it.id, v)}
                          disabled={!hasProduct}>
                          <SelectTrigger
                            className={cn("h-10", !hasProduct && "opacity-60")}>
                            <div className="flex items-center gap-2 min-w-0">
                              <Layers3 className="h-4 w-4 text-muted-foreground shrink-0" />
                              <SelectValue placeholder="Variant" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="base">Base</SelectItem>
                            {(product?.variants || []).map((v) => (
                              <SelectItem key={v.name} value={v.name}>
                                {v.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Warehouse */}
                      <div className="flex-1 min-w-[180px]">
                        <Label className="lg:hidden text-xs text-muted-foreground mb-1 block">
                          Warehouse
                        </Label>

                        <Select
                          value={it.warehouseId ?? NONE}
                          onValueChange={(v) =>
                            updateItem(it.id, {
                              warehouseId: v === NONE ? null : v,
                            })
                          }
                          disabled={!hasProduct}>
                          <SelectTrigger
                            className={cn("h-10", !hasProduct && "opacity-60")}>
                            <div className="flex items-center gap-2 min-w-0">
                              <WarehouseIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                              <SelectValue placeholder="Warehouse" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE}>No warehouse</SelectItem>
                            {warehouses.map((w) => (
                              <SelectItem key={w._id} value={w._id}>
                                {w.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Qty + Rate + Remove */}
                      <div className="flex justify-between lg:justify-end gap-2">
                        <div className="w-20">
                          <Label className="lg:hidden text-xs text-muted-foreground mb-1 block">
                            QTY
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) =>
                              updateItem(it.id, {
                                quantity: Number(e.target.value || 1),
                              })
                            }
                            className="h-10 text-right"
                          />
                        </div>

                        <div className="w-24">
                          <Label className="lg:hidden text-xs text-muted-foreground mb-1 block">
                            Rate
                          </Label>
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
                            className="h-10 text-right"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(it.id)}
                          className="h-10 w-10 text-red-500 hover:text-red-600"
                          aria-label="Remove item">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Row 2: compact totals */}
                    <div className="mt-2 flex items-center justify-between px-1">
                      <div className="text-xs text-muted-foreground">
                        {hasProduct ? (
                          <>
                            {it.variantName ? (
                              <span>
                                Variant:{" "}
                                <span className="text-foreground">
                                  {it.variantName}
                                </span>
                              </span>
                            ) : (
                              <span>Base product</span>
                            )}
                            {it.warehouseId ? (
                              <span className="ml-2">• Warehouse selected</span>
                            ) : (
                              <span className="ml-2">• No warehouse</span>
                            )}
                          </>
                        ) : it.title.trim() ? (
                          <span>Custom item — set rate manually</span>
                        ) : (
                          <span>Pick product or type custom</span>
                        )}
                      </div>

                      <div className="text-xs">
                        <span className="text-muted-foreground">
                          Line total:{" "}
                        </span>
                        <span className="font-semibold">
                          {formatMoney(it.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Summary
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-2xl border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Subtotal</div>
                <div className="text-sm font-semibold">
                  {formatMoney(subTotal)}
                </div>
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
                <div className="text-sm font-semibold">Total Amount</div>
                <div className="text-lg font-bold text-primary">
                  {formatMoney(orderAmount)}
                </div>
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
            <CardTitle className="text-base">Additional Notes</CardTitle>
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg">
              {isSubmitting ? "Updating Order..." : "Update Order"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
