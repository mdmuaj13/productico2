"use client";

import { useEffect, useMemo, useState } from "react";
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
  Clock,
  Warehouse as WarehouseIcon,
  Layers3,
  Plus,
  Check,
  ChevronsUpDown,
} from "lucide-react";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { OrderFormData } from "@/types/order";
import { useProducts } from "@/hooks/products";
import { useWarehouses } from "@/hooks/warehouses";

interface OrderFormProps {
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
  id: string;
  customObjectId?: string;

  // if selected from product list:
  productId: string | null;
  productSlug: string;
  thumbnail?: string;

  // always shown in preview + payload title
  title: string;

  // dependent controls
  variantName: string | null;
  warehouseId: string | null;

  // pricing
  rate: number; // effective unit price (auto from variant/product but editable)
  quantity: number;
  amount: number; // qty * rate
};

function uid() {
  return `${Date.now()}${Math.random().toString(4).slice(2)}`;
}

function toISOFromLocalInput(localValue: string) {
  const d = new Date(localValue);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function formatMoney(amount: number) {
  return `৳${Number(amount || 0).toFixed(2)}`;
}

const NONE = "__none__";

type ProductOption = {
  _id: string;
  title: string;
  price: number;
  salePrice?: number;
};

function getEffectivePrice(base: number, sale?: number) {
  return sale != null ? Number(sale) : Number(base || 0);
}

/**
 * Invoice-create-like searchable dropdown with custom entry (inline, no external import).
 * - Shows product list
 * - Allows typing new value and selecting “Use "X"”
 * - Returns (title, meta)
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

  // keep query aligned with current value when opening
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
        className="w-105 p-0 max-h-90 overflow-hidden"
        align="start"
        side="bottom"
        sideOffset={8}
        avoidCollisions={false}>
        <Command>
          <CommandInput
            placeholder="Search product…"
            value={query}
            onValueChange={setQuery}
          />

          <CommandEmpty className="py-3 text-center text-sm text-muted-foreground">
            No products found
          </CommandEmpty>

          <CommandGroup heading="Products" className="max-h-60 overflow-y-auto">
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

          {/* Custom option like invoice create */}
          <div className="border-t p-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-start"
              disabled={!query.trim() || !!exactMatch}
              onClick={() => {
                const title = query.trim();
                if (!title) return;
                onChange(title, null); // custom
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

export function OrderForm({ onSuccess }: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().slice(0, 16)
  );

  // Fetch products & warehouses
  const { data: productsData } = useProducts({ limit: 200, search: "" });
  const { data: warehousesData } = useWarehouses({ limit: 200 });

  const products: ProductItem[] = productsData?.data || [];
  const warehouses: WarehouseItem[] = warehousesData?.data || [];

  const productOptions: ProductOption[] = useMemo(() => {
    return (products || []).map((p) => ({
      _id: String(p._id),
      title: String(p.title ?? ""),
      price: typeof p.price === "number" ? p.price : Number(p.price || 0),
      salePrice: p.salePrice != null ? Number(p.salePrice) : undefined,
    }));
  }, [products]);

  const findProduct = (id: string) =>
    products.find((p) => String(p._id) === String(id)) || null;

  const [items, setItems] = useState<LineItemUI[]>([
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
    },
  ]);

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

  function makeObjectIdHex24() {
    const bytes = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes => 24 hex chars
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  const handleProductChange = (
    rowId: string,
    title: string,
    meta?: ProductOption | null
  ) => {
    // Custom item (meta null/undefined)
    if (!meta?._id) {
      updateItem(rowId, {
        title,
        productId: null,
        productSlug: "",
        thumbnail: undefined,
        variantName: null,
        warehouseId: null,
        rate: 0, // custom starts at 0 like invoice create
        customObjectId: makeObjectIdHex24(),
      });
      return;
    }

    const product = findProduct(meta._id);

    // fallback if product not in full list for some reason
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
    });
  };

  const handleVariantChange = (rowId: string, value: string) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        if (!row.productId) return row; // custom item => no variants

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
          rate: nextRate, // auto update rate when variant changes
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
      const productsWithWarehouse = items.map((it) => {
        const mongoId = it.productId
          ? String(it.productId) // real product ObjectId
          : String(it.customObjectId || makeObjectIdHex24()); // For custom items, we still send a stable _id-like string to keep backend happy.

        return {
          _id: mongoId,
          slug: it.productSlug || "",
          title: it.title,
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
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.error || "Failed to create order");

      toast.success("Order created successfully");
      onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create order";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <SheetHeader className="mb-6">
        <SheetTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Create New Order
        </SheetTitle>
      </SheetHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <CardTitle className="text-base">
                  Customer Information
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-sm">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name", { required: "Name is required" })}
                    placeholder="Customer name"
                    className={cn(errors.name && "border-red-500")}
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
                      className={cn(errors.contact_number && "border-red-500")}
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
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    {...register("address", {
                      required: "Address is required",
                    })}
                    placeholder="Delivery address"
                    className={cn(errors.address && "border-red-500")}
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
                    className={cn(errors.city && "border-red-500")}
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
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <CardTitle className="text-base">Order Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="order_code" className="text-sm">
                    Order Code
                  </Label>
                  <Input
                    id="order_code"
                    {...register("order_code")}
                    readOnly
                    className="bg-muted font-mono text-xs"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="order_date"
                    className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Order Date &amp; Time
                  </Label>
                  <Input
                    id="order_date"
                    type="datetime-local"
                    value={orderDate}
                    onChange={(e) => {
                      setOrderDate(e.target.value);
                      setValue(
                        "order_date",
                        toISOFromLocalInput(e.target.value) as any
                      );
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="order_status" className="text-sm">
                      Order Status
                    </Label>
                    <Controller
                      name="order_status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">
                              Processing
                            </SelectItem>
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
                    <Label htmlFor="order_payment_status" className="text-sm">
                      Payment Status
                    </Label>
                    <Controller
                      name="order_payment_status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <SelectTrigger>
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
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ ITEM ADDING SECTION — SAME STYLE AS INVOICE CREATE */}
        {/* ✅ ITEM ADDING SECTION — Compact & beautiful (flex, responsive) */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Order items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add item
            </Button>
          </CardHeader>

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
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <CardTitle className="text-base">Financial Summary</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 p-2">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm">Subtotal ({items.length} items)</span>
                <span className="font-medium">৳{subTotal.toFixed(2)}</span>
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
                  />
                </div>
              </div>

              <div className="flex justify-between items-center bg-accent p-3 rounded">
                <span className="font-medium">Order Total</span>
                <span className="text-xl font-bold text-primary">
                  ৳{orderAmount.toFixed(2)}
                </span>
              </div>

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
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-medium">Due Amount</span>
                <span
                  className={cn(
                    "text-xl font-bold",
                    dueAmount > 0
                      ? "text-red-600"
                      : dueAmount === 0
                      ? "text-green-600"
                      : "text-blue-600"
                  )}>
                  ৳{dueAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="sticky bottom-0 bg-background pt-3 pb-2 border-t">
          <Button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="w-full"
            size="lg"
            onClick={handleSubmit(onSubmit)}>
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                Creating Order...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Create Order
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
