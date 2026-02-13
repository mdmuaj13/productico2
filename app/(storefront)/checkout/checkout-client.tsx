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

function formatMoney(n: number) {
  // adjust if you have currency formatting util already
  return Math.round(n).toString();
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
    notes: "",
  });

  const [paymentType, setPaymentType] = useState<PaymentType>("cash");

  // Voucher state
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
    !loading;

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

    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      alert("Please fill Name, Phone and Address.");
      return;
    }

    const safePaymentType: PaymentType = "cash";

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items,
          discount: discount
            ? { id: discount._id, code: discount.code, amount: discountAmount }
            : null,
          totals: { ...totals, discount: discountAmount, total: payableTotal },
          paymentType: safePaymentType,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.error || "Checkout failed");
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

  // ✅ Reusable Voucher UI: render it right below OrderSummaryCard everywhere
  const VoucherSection = (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Voucher / Discount
          </h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
            Enter your voucher code (or discount id).
          </p>
        </div>

        {discount ? (
          <button
            onClick={removeVoucher}
            className="text-xs font-semibold text-gray-700 hover:opacity-80 dark:text-gray-200"
            type="button"
          >
            Remove
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={voucherInput}
          onChange={(e) => setVoucherInput(e.target.value)}
          placeholder="e.g. SAVE10 (or 65f1...)"
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

      <main className="container mx-auto px-4 py-6">
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
            <DeliveryFormCard form={form} setForm={setForm} />

            {/* ✅ Mobile summary + voucher under it */}
            <div className="lg:hidden space-y-4">
              <OrderSummaryCard items={items} discount={discountAmount} subtotal={totals.subtotal}  total={payableTotal} />
              {VoucherSection}
            </div>
          </section>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-[76px] space-y-4">
              <PaymentMethodCard paymentType={paymentType} setPaymentType={setPaymentType} />

              {/* ✅ Desktop summary + voucher under it */}
              <div className="hidden lg:block space-y-4">
                <OrderSummaryCard items={items} discount={discountAmount} subtotal={totals.subtotal}  total={payableTotal} />
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

              <MobileStickyBar
                total={payableTotal} // ✅ discounted total
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
