"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CartItem, clearCart, getCart, cartTotals } from "@/lib/cart";

import { CheckoutHeader } from "../_components/checkout/CheckoutHeader";
import { DeliveryFormCard } from "../_components/checkout/DeliveryFormCard";
import { PaymentMethodCard, PaymentType } from "../_components/checkout/PaymentMethodCard";
import { OrderSummaryCard } from "../_components/checkout/OrderSummaryCard";
import { MobileStickyBar } from "../_components/checkout/MobileStickyBar";

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

  useEffect(() => {
    const sync = () => setItems(getCart());
    sync();
    window.addEventListener("cart:updated", sync as any);
    return () => window.removeEventListener("cart:updated", sync as any);
  }, []);

  const totals = useMemo(() => cartTotals(items), [items]);

  const canPlace =
    !!items.length &&
    !!form.name.trim() &&
    !!form.phone.trim() &&
    !!form.address.trim() &&
    !loading;

  async function placeOrder() {
    if (!items.length) return;

    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      alert("Please fill Name, Phone and Address.");
      return;
    }

    // Force COD only
    const safePaymentType: PaymentType = "cash";

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items,
          totals,
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

            {/* Mobile summary */}
            <div className="lg:hidden">
              <OrderSummaryCard items={items} subtotal={totals.subtotal} />
            </div>
          </section>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-[76px] space-y-4">
              <PaymentMethodCard
                paymentType={paymentType}
                setPaymentType={setPaymentType}
              />

              {/* Desktop summary */}
              <div className="hidden lg:block">
                <OrderSummaryCard items={items} subtotal={totals.subtotal} />
                <button
                  onClick={placeOrder}
                  disabled={!canPlace}
                  className={`mt-4 w-full rounded-2xl px-5 py-3 font-semibold text-sm transition inline-flex items-center justify-center gap-2 ${
                    !canPlace
                      ? "opacity-50 pointer-events-none bg-gray-300 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      : "bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90"
                  }`}
                >
                  {loading ? "Processing..." : "Place order"}
                </button>
              </div>

              <MobileStickyBar
                total={totals.subtotal}
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
