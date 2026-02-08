"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, ShieldCheck } from "lucide-react";

import { CartItem, clearCart, getCart, cartTotals } from "@/lib/cart";

function formatMoney(n: number) {
  return `৳ ${n.toLocaleString()}`;
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

  useEffect(() => {
    const sync = () => setItems(getCart());
    sync();
    window.addEventListener("cart:updated", sync as any);
    return () => window.removeEventListener("cart:updated", sync as any);
  }, []);

  const totals = useMemo(() => cartTotals(items), [items]);

  async function placeOrder() {
    if (!items.length) return;

    // very basic validation
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      alert("Please fill Name, Phone and Address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items,
          totals,
        }),
      });

      if (!res.ok) {
        alert("Checkout failed. Please try again.");
        return;
      }

      // success
      clearCart();
      setItems([]);
      router.push("/checkout/success");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">


      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Form */}
          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Delivery details
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Fill in your information to place the order.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure checkout
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-1">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Full name *
                  </div>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/20 px-4 py-3 text-sm outline-none"
                    placeholder="Your name"
                  />
                </label>

                <label className="space-y-1">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Phone *
                  </div>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/20 px-4 py-3 text-sm outline-none"
                    placeholder="01XXXXXXXXX"
                  />
                </label>

                <label className="space-y-1 sm:col-span-2">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Email (optional)
                  </div>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/20 px-4 py-3 text-sm outline-none"
                    placeholder="you@email.com"
                  />
                </label>

                <label className="space-y-1 sm:col-span-2">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Full address *
                  </div>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
                    className="w-full min-h-[110px] rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/20 px-4 py-3 text-sm outline-none"
                    placeholder="House, Road, Area, City"
                  />
                </label>

                <label className="space-y-1 sm:col-span-2">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Notes (optional)
                  </div>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
                    className="w-full min-h-[90px] rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/20 px-4 py-3 text-sm outline-none"
                    placeholder="Delivery instructions, preferred time, etc."
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Summary */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-[92px] space-y-4">
              <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 p-6">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  Order summary
                </div>

                {items.length ? (
                  <div className="mt-4 space-y-3">
                    {items.map((it) => (
                      <div key={it.productId} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                            {it.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {it.qty} × {formatMoney(it.price)}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatMoney(it.price * it.qty)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                    Your cart is empty. <Link className="underline" href="/products">Go shopping</Link>
                  </div>
                )}

                <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-800 space-y-2 text-sm">
                  <div className="flex items-center justify-between text-gray-700 dark:text-gray-200">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatMoney(totals.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Delivery</span>
                    <span>Cash on delivery</span>
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatMoney(totals.subtotal)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={!items.length || loading}
                  className={`mt-5 w-full rounded-2xl px-5 py-3 font-semibold text-sm transition inline-flex items-center justify-center gap-2 ${
                    !items.length || loading
                      ? "opacity-50 pointer-events-none bg-gray-300 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      : "bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90"
                  }`}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Place order
                </button>

                <div className="mt-3 text-xs text-gray-500">
                  By placing an order you agree to our store policies.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
