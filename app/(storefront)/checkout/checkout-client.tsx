"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CartItem, clearCart, getCart, cartTotals } from "@/lib/cart";

import { CheckoutHeader } from "../_components/checkout/CheckoutHeader";
import { DeliveryFormCard } from "../_components/checkout/DeliveryFormCard";
import { PaymentMethodCard, PaymentType } from "../_components/checkout/PaymentMethodCard";
import { OrderSummaryCard } from "../_components/checkout/OrderSummaryCard";
import { MobileStickyBar } from "../_components/checkout/MobileStickyBar";

type DiscountDoc = {
  _id: string;
  code?: string;

  type?: "percentage" | "fixed" | "percent" | "amount";
  value?: number;
  percentOff?: number;
  amountOff?: number;

  minimumSubtotal?: number;
  maxDiscount?: number;

  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;

  deletedAt?: string | null;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function computeDiscountAmount(subtotal: number, discount?: DiscountDoc | null) {
  if (!discount) return 0;

  if (discount.deletedAt) return 0;
  if (discount.isActive === false) return 0;

  const now = Date.now();
  if (discount.startsAt && Date.parse(discount.startsAt) > now) return 0;
  if (discount.endsAt && Date.parse(discount.endsAt) < now) return 0;

  if (typeof discount.minimumSubtotal === "number" && subtotal < discount.minimumSubtotal) {
    return 0;
  }

  const inferredPercent =
    typeof discount.percentOff === "number"
      ? discount.percentOff
      : discount.type === "percentage" || discount.type === "percent"
        ? discount.value
        : undefined;

  const inferredAmount =
    typeof discount.amountOff === "number"
      ? discount.amountOff
      : discount.type === "fixed" || discount.type === "amount"
        ? discount.value
        : undefined;

  let amount = 0;

  if (typeof inferredPercent === "number") amount = (subtotal * inferredPercent) / 100;
  else if (typeof inferredAmount === "number") amount = inferredAmount;

  if (typeof discount.maxDiscount === "number") amount = Math.min(amount, discount.maxDiscount);

  return clamp(amount, 0, subtotal);
}

export default function CheckoutClient() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "", // ✅ required by publicOrderSchema
    notes: "",
  });

  const [paymentType, setPaymentType] = useState<PaymentType>("cash");

  // Voucher UI state (client-side preview only)
  const [voucherInput, setVoucherInput] = useState("");
  const [discount, setDiscount] = useState<DiscountDoc | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setItems(getCart());
    sync();
    window.addEventListener("cart:updated", sync as any);
    return () => window.removeEventListener("cart:updated", sync as any);
  }, []);

  const totals = useMemo(() => cartTotals(items), [items]);

  const discountAmount = useMemo(
    () => computeDiscountAmount(totals.subtotal, discount),
    [totals.subtotal, discount],
  );

  const payableTotal = useMemo(
    () => Math.max(0, totals.subtotal - discountAmount),
    [totals.subtotal, discountAmount],
  );

  const canPlace =
    !!items.length &&
    !!form.name.trim() &&
    !!form.phone.trim() &&
    !!form.address.trim() &&
    !!form.city.trim() &&
    !loading;

  // Helper to safely extract a variant name from cart item
  function getVariantName(it: any): string | undefined {
    const v1 = it?.variantName;
    const v2 = it?.variant?.name;
    const v3 = it?.selectedVariant?.name;

    const candidate = typeof v1 === "string" ? v1 : typeof v2 === "string" ? v2 : typeof v3 === "string" ? v3 : "";
    const cleaned = candidate?.trim();
    return cleaned ? cleaned : undefined;
  }

  async function applyVoucher() {
    const raw = voucherInput.trim();
    if (!raw) return;

    setDiscountError(null);
    setDiscountLoading(true);

    try {
      const isObjectId = /^[a-f\d]{24}$/i.test(raw);

      const url = isObjectId
        ? `/api/discounts/${raw}`
        : `/api/discounts/by-code/${encodeURIComponent(raw)}`;

      const res = await fetch(url, { method: "GET" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setDiscount(null);
        setDiscountError(data?.message || data?.error || "Invalid voucher/discount");
        return;
      }

      const d: DiscountDoc | undefined = data?.data ?? data?.discount ?? data;
      if (!d?._id) {
        setDiscount(null);
        setDiscountError("Discount format invalid");
        return;
      }

      const computed = computeDiscountAmount(totals.subtotal, d);
      if (computed <= 0) {
        setDiscount(d);
        setDiscountError("This discount is not applicable for your cart subtotal.");
        return;
      }

      setDiscount(d);
      setDiscountError(null);
    } catch (e) {
      setDiscount(null);
      setDiscountError("Failed to apply voucher. Please try again.");
      console.error(e);
    } finally {
      setDiscountLoading(false);
    }
  }

  function removeVoucher() {
    setDiscount(null);
    setVoucherInput("");
    setDiscountError(null);
  }

  async function placeOrder() {
    if (!items.length) return;

    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      alert("Please fill Name, Phone, Address and City.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Use your public order route instead of /api/public/orders
      const res = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email?.trim() || "",
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(), // ✅ required

          // publicOrderSchema expects string or undefined (not null)
          discountCode: voucherInput.trim() ? voucherInput.trim().toUpperCase() : undefined,

          items: items.map((it: any) => {
            const variantName = getVariantName(it);

            return {
              productId: String(it.productId),
              quantity: Number(it.qty),

              // ✅ only include if string
              ...(variantName ? { variantName } : {}),
            };
          }),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.message || data?.error || "Checkout failed");
        console.log(data);
        return;
      }

      clearCart();
      setItems([]);
      router.push("/checkout/success");
    } finally {
      setLoading(false);
    }
  }

  const VoucherSection = (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Voucher / Discount
          </h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
            Enter your voucher code.
          </p>
        </div>

        {voucherInput.trim() ? (
          <button
            onClick={removeVoucher}
            className="text-xs font-semibold text-gray-700 hover:opacity-80 dark:text-gray-200"
            type="button"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={voucherInput}
          onChange={(e) => setVoucherInput(e.target.value)}
          placeholder="e.g. SAVE10"
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:focus:ring-white/10"
        />
        <button
          onClick={applyVoucher}
          disabled={!voucherInput.trim() || discountLoading}
          className={`h-11 shrink-0 rounded-xl px-4 text-sm font-semibold transition ${
            !voucherInput.trim() || discountLoading
              ? "opacity-50 pointer-events-none bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              : "bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90"
          }`}
          type="button"
        >
          {discountLoading ? "Applying..." : "Apply"}
        </button>
      </div>

      {discountError ? (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{discountError}</p>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <CheckoutHeader />

      {/* ✅ add bottom padding so fixed mobile bar never overlaps content */}
      <main className="container mx-auto px-4 py-6 pb-28 lg:pb-6">
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Fill in your details and confirm your order.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <section className="lg:col-span-7 space-y-6">
            {/* ✅ DeliveryFormCard must support city now */}
            <DeliveryFormCard form={form} setForm={setForm} />

            {/* ✅ Mobile summary + voucher below summary */}
            <div className="lg:hidden space-y-4">
              <OrderSummaryCard
                items={items}
                subtotal={totals.subtotal}
                discount={discountAmount}
                total={payableTotal}
              />
              {VoucherSection}
            </div>
          </section>

          <aside className="lg:col-span-5">
            <div className="space-y-4">
              <PaymentMethodCard paymentType={paymentType} setPaymentType={setPaymentType} />

              {/* ✅ Desktop summary + voucher below summary */}
              <div className="hidden lg:block space-y-4">
                <OrderSummaryCard
                  items={items}
                  subtotal={totals.subtotal}
                  discount={discountAmount}
                  total={payableTotal}
                />
                {VoucherSection}

                <button
                  onClick={placeOrder}
                  disabled={!canPlace}
                  className={`w-full rounded-2xl px-5 py-3 font-semibold text-sm transition inline-flex items-center justify-center gap-2 ${
                    !canPlace
                      ? "opacity-50 pointer-events-none bg-gray-300 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      : "bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90"
                  }`}
                >
                  {loading ? "Processing..." : "Place order"}
                </button>
              </div>

              {/* ✅ mobile fixed bar should be fixed in its component */}
              <MobileStickyBar
                total={payableTotal}
                canPlace={canPlace}
                loading={loading}
                onPlace={placeOrder}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
