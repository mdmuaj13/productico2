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
import {
  Package,
  DollarSign,
  User,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Search,
  Clock,
  Warehouse as WarehouseIcon,
  Layers3,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { OrderFormData } from '@/types/order';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useProducts } from '@/hooks/products';
import { useWarehouses } from '@/hooks/warehouses';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OrderFormProps {
  onSuccess: () => void;
}

interface OrderProductItem {
  _id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  thumbnail?: string;
  variantName: string | null;
  warehouseId: string | null;
  warehouseName: string | null;
  price: number;
  salePrice?: number;
  quantity: number;
  lineTotal: number;
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

export function OrderForm({ onSuccess }: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderProducts, setOrderProducts] = useState<OrderProductItem[]>([]);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 16));
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products and warehouses
  const { data: productsData } = useProducts({ limit: 100, search: searchQuery });
  const { data: warehousesData } = useWarehouses({ limit: 100 });

  const products: ProductItem[] = productsData?.data || [];
  const warehouses: WarehouseItem[] = warehousesData?.data || [];

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
      order_status: 'pending',
      order_payment_status: 'unpaid',
      discount_amount: 0,
      delivery_cost: 0,
      paid_amount: 0,
    },
  });

  const watchDiscountAmount = watch('discount_amount', 0);
  const watchDeliveryCost = watch('delivery_cost', 0);
  const watchPaidAmount = watch('paid_amount', 0);

  // Calculate totals
  const subTotal = orderProducts.reduce((sum, product) => sum + product.lineTotal, 0);
  const orderAmount = subTotal - (watchDiscountAmount || 0) + (watchDeliveryCost || 0);
  const dueAmount = orderAmount - (watchPaidAmount || 0);

  useEffect(() => {
    setValue('order_amount', orderAmount);
    setValue('due_amount', dueAmount);
  }, [orderAmount, dueAmount, setValue]);

  const addProductToOrder = (product: ProductItem, variantName: string | null, warehouseId: string | null) => {
    let warehouseName: string | null = null;

    if (warehouseId) {
      const warehouse = warehouses.find((w) => w._id === warehouseId);
      if (!warehouse) {
        toast.error('Please select a valid warehouse');
        return;
      }
      warehouseName = warehouse.title;
    }

    const variant = variantName ? product.variants?.find((v) => v.name === variantName) ?? null : null;

    const price = variant?.price ?? product.price;
    const salePrice = variant?.salePrice ?? product.salePrice;
    const effectivePrice = salePrice ?? price;

    const newProduct: OrderProductItem = {
      _id: `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      productId: product._id,
      productTitle: product.title,
      productSlug: product.slug,
      thumbnail: product.thumbnail,
      variantName,
      warehouseId,
      warehouseName,
      price,
      salePrice,
      quantity: 1,
      lineTotal: effectivePrice,
    };

    setOrderProducts((prev) => [...prev, newProduct]);
    toast.success('Added to order');
  };

  const removeProduct = (index: number) => {
    setOrderProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const updateProductQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;

    setOrderProducts((prev) => {
      const updated = [...prev];
      const product = updated[index];
      if (!product) return prev;

      const effectivePrice = product.salePrice ?? product.price;

      updated[index] = {
        ...product,
        quantity,
        lineTotal: effectivePrice * quantity,
      };

      return updated;
    });
  };

  const onSubmit = async (data: OrderFormData) => {
    if (orderProducts.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    setIsSubmitting(true);

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
    }));

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

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to create order');

      toast.success('Order created successfully');
      onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create order';
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
                <CardTitle className="text-base">Customer Information</CardTitle>
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
                    {...register('name', { required: 'Name is required' })}
                    placeholder="Customer name"
                    className={cn(errors.name && 'border-red-500')}
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
                      {...register('contact_number', { required: 'Contact is required' })}
                      placeholder="Phone number"
                      className={cn(errors.contact_number && 'border-red-500')}
                    />
                    {errors.contact_number && (
                      <p className="text-xs text-red-500 mt-1">{errors.contact_number.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm">
                      Email
                    </Label>
                    <Input id="email" type="email" {...register('email')} placeholder="customer@example.com" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    {...register('address', { required: 'Address is required' })}
                    placeholder="Delivery address"
                    className={cn(errors.address && 'border-red-500')}
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
                </div>

                <div>
                  <Label htmlFor="city" className="text-sm">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    {...register('city', { required: 'City is required' })}
                    placeholder="City"
                    className={cn(errors.city && 'border-red-500')}
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
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
                  <Input id="order_code" {...register('order_code')} readOnly className="bg-muted font-mono text-xs" />
                </div>

                <div>
                  <Label htmlFor="order_date" className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Order Date &amp; Time
                  </Label>
                  <Input
                    id="order_date"
                    type="datetime-local"
                    value={orderDate}
                    onChange={(e) => {
                      setOrderDate(e.target.value);
                      setValue('order_date', new Date(e.target.value).toISOString());
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-gray-400" /> Pending
                              </span>
                            </SelectItem>
                            <SelectItem value="processing">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-400" /> Processing
                              </span>
                            </SelectItem>
                            <SelectItem value="confirmed">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-400" /> Confirmed
                              </span>
                            </SelectItem>
                            <SelectItem value="shipped">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-purple-400" /> Shipped
                              </span>
                            </SelectItem>
                            <SelectItem value="delivered">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500" /> Delivered
                              </span>
                            </SelectItem>
                            <SelectItem value="cancelled">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-400" /> Cancelled
                              </span>
                            </SelectItem>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unpaid">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-400" /> Unpaid
                              </span>
                            </SelectItem>
                            <SelectItem value="partial">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-yellow-400" /> Partial
                              </span>
                            </SelectItem>
                            <SelectItem value="paid">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-400" /> Paid
                              </span>
                            </SelectItem>
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
                    {...register('remark')}
                    placeholder="Any additional notes or special instructions..."
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Split Section */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <CardTitle className="text-base">Products ({orderProducts.length})</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ProductSearchPanel
                products={products}
                warehouses={warehouses}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onAddProduct={addProductToOrder}
              />

              <SelectedProductList
                orderProducts={orderProducts}
                onRemove={removeProduct}
                onUpdateQty={updateProductQuantity}
              />
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
                <span className="text-sm">Subtotal ({orderProducts.length} items)</span>
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
                    {...register('discount_amount', { valueAsNumber: true })}
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
                    {...register('delivery_cost', { valueAsNumber: true })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center bg-accent p-3 rounded">
                <span className="font-medium">Order Total</span>
                <span className="text-xl font-bold text-primary">৳{orderAmount.toFixed(2)}</span>
              </div>

              <div>
                <Label htmlFor="paid_amount" className="text-sm">
                  Paid Amount (৳)
                </Label>
                <Input
                  id="paid_amount"
                  type="number"
                  {...register('paid_amount', { valueAsNumber: true })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-medium">Due Amount</span>
                <span
                  className={cn(
                    'text-xl font-bold',
                    dueAmount > 0 ? 'text-red-600' : dueAmount === 0 ? 'text-green-600' : 'text-blue-600'
                  )}
                >
                  ৳{dueAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="sticky bottom-0 bg-background pt-3 pb-2 border-t">
          <Button type="submit" disabled={isSubmitting || orderProducts.length === 0} className="w-full" size="lg">
            {isSubmitting ? (
              <span className="flex items-center justify-center">Creating Order...</span>
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

/** LEFT PANEL: auto-add on product click, redesigned warehouse picker */
interface ProductSearchPanelProps {
  products: ProductItem[];
  warehouses: WarehouseItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddProduct: (product: ProductItem, variantName: string | null, warehouseId: string | null) => void;
}

function ProductSearchPanel({
  products,
  warehouses,
  searchQuery,
  setSearchQuery,
  onAddProduct,
}: ProductSearchPanelProps) {
  // IMPORTANT: radix/shadcn doesn't allow SelectItem value=""
  const NONE_WAREHOUSE = '__none__';

  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(NONE_WAREHOUSE);

  // Keeping this as a "future-ready" control; currently we don't do product-specific variant picking in this panel.
  // If you want: inline variants per product row (best UX), tell me and I'll rewrite it that way.
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  const warehouseLabel = useMemo(() => {
    if (selectedWarehouse === NONE_WAREHOUSE) return null;
    return warehouses.find((w) => w._id === selectedWarehouse)?.title ?? null;
  }, [selectedWarehouse, warehouses]);

  const handlePickProduct = (product: ProductItem) => {
    const variantExists = !!selectedVariant && product.variants?.some((v) => v.name === selectedVariant);
    const safeVariant = variantExists ? selectedVariant : null;

    onAddProduct(
      product,
      safeVariant,
      selectedWarehouse === NONE_WAREHOUSE ? null : selectedWarehouse
    );

    setSelectedVariant(null);
  };

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Search className="h-4 w-4" />
            Product Search
          </CardTitle>

          <Badge variant="outline" className="gap-1">
            <WarehouseIcon className="h-3.5 w-3.5" />
            <span className="text-xs">{warehouseLabel ? warehouseLabel : 'No warehouse'}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-3 space-y-3">

        {/* Product List: click to add */}
        <div className="space-y-2">
          <Label className="text-sm">Click a product to add</Label>

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

          <div className="border rounded-xl divide-y max-h-105 overflow-y-auto">
            {products.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No products found</div>
            ) : (
              products.map((product) => (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => handlePickProduct(product)}
                  className="w-full text-left p-3 hover:bg-accent transition-colors flex gap-2"
                >
                  {product.thumbnail && (
                    <div className="bg-gray-100 rounded-lg p-1 shrink-0">
                      <img src={product.thumbnail} alt={product.title} className="w-10 h-10 object-cover rounded-md" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-sm truncate">{product.title}</h4>
                      <span className="text-sm font-semibold text-primary whitespace-nowrap">
                        ৳{product.salePrice || product.price}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {product.variants?.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {product.variants.length} variants
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        Stock: {product.quantity || 0}
                      </Badge>

                      {warehouseLabel && (
                        <Badge variant="outline" className="text-xs">
                          {warehouseLabel}
                        </Badge>
                      )}

                      {selectedVariant && (
                        <Badge variant="secondary" className="text-xs">
                          Variant: {selectedVariant}
                        </Badge>
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground mt-1">Click to add to order</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

		{/* Redesigned Warehouse Select */}
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <WarehouseIcon className="h-4 w-4" />
            Warehouse (optional)
          </Label>

          <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
            <SelectTrigger className="h-11 rounded-xl">
              <div className="flex items-center gap-2">
                <SelectValue placeholder="Choose warehouse for next adds" />
              </div>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value={NONE_WAREHOUSE}>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent text-muted-foreground">
                    <WarehouseIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm">No warehouse</span>
                </div>
              </SelectItem>

              {warehouses.map((w) => (
                <SelectItem key={w._id} value={w._id}>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent text-muted-foreground">
                      <WarehouseIcon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm">{w.title}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-xs text-muted-foreground">
            This warehouse will be applied when you click a product to add it.
          </p>
        </div>

        {/* OPTIONAL Variant control (safe but basic) */}
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Layers3 className="h-4 w-4" />
            Variant (optional)
          </Label>

          <Select
            value={selectedVariant || 'base'}
            onValueChange={(value) => setSelectedVariant(value === 'base' ? null : value)}
          >
            <SelectTrigger className="h-11 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-muted-foreground">
                  <Tag className="h-4 w-4" />
                </span>
                <SelectValue placeholder="Pick variant (applies to next click)" />
              </div>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="base">Base product</SelectItem>
              {/* Replace these with your common variant names OR remove this whole block */}
              <SelectItem value="Small">Small</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Large">Large</SelectItem>
            </SelectContent>
          </Select>

          <p className="text-xs text-muted-foreground">
            If this variant doesn’t exist for a product, it will add as base product.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/** RIGHT PANEL: Selected products list */
interface SelectedProductListProps {
  orderProducts: OrderProductItem[];
  onRemove: (index: number) => void;
  onUpdateQty: (index: number, qty: number) => void;
}

function SelectedProductList({ orderProducts, onRemove, onUpdateQty }: SelectedProductListProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="h-4 w-4" />
          Selected Products ({orderProducts.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3">
        {orderProducts.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No products added yet</p>
            <p className="text-xs">Click a product on the left to add it</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orderProducts.map((product, index) => (
              <div key={product._id} className="border rounded-lg p-3 hover:bg-accent/30 transition-colors">
                <div className="flex gap-3 mb-3">
                  {product.thumbnail && (
                    <div className="bg-gray-100 rounded p-1 shrink-0">
                      <img
                        src={product.thumbnail}
                        alt={product.productTitle}
                        className="w-12 h-12 sm:w-10 sm:h-10 object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h4 className="font-medium text-sm truncate">{product.productTitle}</h4>
                      {product.variantName && (
                        <Badge variant="secondary" className="text-xs w-fit">
                          {product.variantName}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {product.warehouseName && (
                        <Badge variant="outline" className="text-xs">
                          {product.warehouseName}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">৳{product.salePrice || product.price} each</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 shrink-0"
                    onClick={() => onRemove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => onUpdateQty(index, product.quantity - 1)}
                      disabled={product.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium min-w-6 text-center">{product.quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => onUpdateQty(index, product.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="text-sm font-semibold">৳{product.lineTotal.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
