"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  BadgeCheck,
} from "lucide-react";

import {
  CartItem,
  getCart,
  clearCart,
  removeFromCart,
  updateQty,
  cartTotals,
} from "@/lib/cart";

function formatMoney(n: number) {
  return `৳ ${n.toLocaleString()}`;
}

export default function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(getCart());
    sync();
    window.addEventListener("cart:updated", sync as any);
    return () => window.removeEventListener("cart:updated", sync as any);
  }, []);

  const totals = useMemo(() => cartTotals(items), [items]);

  function dec(id: string, current: number) {
    updateQty(id, current - 1);
    setItems(getCart());
  }
  function inc(id: string, current: number) {
    updateQty(id, current + 1);
    setItems(getCart());
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Items */}
          <section className="lg:col-span-8">
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Your cart
                  </h1>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {totals.count
                      ? `${totals.count} item(s)`
                      : "Your cart is empty."}
                  </p>
                </div>

                {items.length ? (
                  <button
                    onClick={() => {
                      clearCart();
                      setItems([]);
                    }}
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:opacity-80">
                    Clear cart
                  </button>
                ) : null}
              </div>

              {items.length ? (
                <div className="mt-6 space-y-4">
                  {items.map((it) => (
                    <div
                      key={it.productId}
                      className="flex gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/20 p-4">
                      <div className="h-20 w-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 shrink-0">
                        {it.image ? (
                          <img
                            src={it.image}
                            alt={it.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full grid place-items-center text-xs text-gray-500">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={
                            it.slug
                              ? `/products/${encodeURIComponent(it.slug)}`
                              : `/product/${it.productId}`
                          }
                          className="font-semibold text-gray-900 dark:text-white hover:opacity-80 line-clamp-1">
                          {it.title}
                        </Link>

                        <div className="mt-1 text-xs text-gray-500">
                          Unit price: {formatMoney(it.price)}{" "}
                          {it.unit ? ` • ${it.unit}` : ""}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          {/* qty controls */}
                          <div className="inline-flex items-center rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/30 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => dec(it.productId, it.qty)}
                              className="h-10 w-10 grid place-items-center hover:bg-gray-50 dark:hover:bg-gray-900/40 transition"
                              aria-label="Decrease quantity">
                              <Minus className="h-4 w-4" />
                            </button>

                            <div className="h-10 min-w-[52px] grid place-items-center text-sm font-semibold text-gray-900 dark:text-white">
                              {it.qty}
                            </div>

                            <button
                              type="button"
                              onClick={() => inc(it.productId, it.qty)}
                              className="h-10 w-10 grid place-items-center hover:bg-gray-50 dark:hover:bg-gray-900/40 transition"
                              aria-label="Increase quantity">
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatMoney(it.price * it.qty)}
                            </div>
                            <button
                              onClick={() => {
                                removeFromCart(it.productId);
                                setItems(getCart());
                              }}
                              className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition"
                              aria-label="Remove">
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/25 p-8 text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/30">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Your cart is empty
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Browse products and add items to your cart.
                  </div>
                  <div className="mt-5">
                    <Link
                      href="/products"
                      className="rounded-2xl px-5 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-semibold text-sm hover:opacity-90 transition inline-flex items-center gap-2">
                      Go to products
                      <BadgeCheck className="h-4 w-4 opacity-80" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Summary */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-[92px] space-y-4">
              <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/30 p-6">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  Order summary
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between text-gray-700 dark:text-gray-200">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      {formatMoney(totals.subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Delivery</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatMoney(totals.subtotal)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  <Link
                    href="/checkout"
                    className={`rounded-2xl px-5 py-3 font-semibold text-sm text-center transition ${
                      items.length
                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90"
                        : "pointer-events-none opacity-50 bg-gray-300 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}>
                    Proceed to checkout
                  </Link>

                  <Link
                    href="/products"
                    className="rounded-2xl px-5 py-3 font-semibold text-sm text-center border border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-900/40 transition">
                    Continue shopping
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
